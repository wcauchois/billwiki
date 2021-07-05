use crate::store::Store;
use actix::prelude::*;
use anyhow::anyhow;
use htmlescape::encode_minimal;
use std::cmp::min;
use std::sync::{Arc, Mutex};
use tantivy::{SnippetGenerator, doc};
use tantivy::{schema::*, Index};

const NAME_FIELD: &str = "name";
const CONTENT_FIELD: &str = "content";
const SNIPPET_MAX_NUM_CHARS: usize = 150;

#[derive(Message)]
#[rtype(result = "()")]
pub struct Reindex;

#[derive(Message)]
#[rtype(result = "anyhow::Result<Vec<SearchResult>>")]
pub struct Search {
    query: String,
}

impl Search {
    pub fn new<T: ToString>(query: T) -> Search {
        Search {
            query: query.to_string(),
        }
    }
}

pub struct SearchActor {
    store: Arc<Mutex<Store>>,
    index: Index,
}

#[derive(Debug)]
pub struct SearchResult {
    pub name_field: SearchResultField,
    pub content_field: SearchResultField,
}

#[derive(Debug, Clone)]
pub struct SearchResultField {
    pub text: String,
    pub snippet_html: String,
}

impl SearchResultField {
    fn create(doc: &Document, field: Field, snippet_generator: &SnippetGenerator) -> anyhow::Result<SearchResultField> {
        let field_text = doc
            .get_first(field)
            .ok_or(anyhow!("Expected field"))?
            .text()
            .ok_or(anyhow!("Expected field to be text"))?;
        let snippet = snippet_generator.snippet_from_doc(&doc);
        let snippet_html = if snippet.highlighted().len() > 0 {
            snippet.to_html()
        } else {
            // If there's no matching snippet, just return the first characters.
            encode_minimal(&field_text[..min(field_text.len(), SNIPPET_MAX_NUM_CHARS)])
        };
        Ok(SearchResultField {
            text: field_text.to_string(),
            snippet_html,
        })
    }
}

impl SearchActor {
    fn create_schema() -> Schema {
        let text_indexing_options = TextFieldIndexing::default()
            .set_index_option(IndexRecordOption::WithFreqsAndPositions)
            .set_tokenizer("en_stem");

        let text_options = TextOptions::default()
            .set_indexing_options(text_indexing_options)
            .set_stored();

        let mut schema_bldr = SchemaBuilder::new();

        schema_bldr.add_text_field(NAME_FIELD, text_options.clone());
        schema_bldr.add_text_field(CONTENT_FIELD, text_options.clone());

        schema_bldr.build()
    }

    pub fn new(store: Arc<Mutex<Store>>) -> anyhow::Result<SearchActor> {
        let schema = Self::create_schema();
        let index = Index::create_in_ram(schema);

        Ok(SearchActor { store, index })
    }

    fn reindex(&mut self) -> anyhow::Result<()> {
        // Should potentially consider updating relevant documents instead of fully reindexing
        // https://github.com/tantivy-search/tantivy/blob/main/examples/deleting_updating_documents.rs

        let pages = {
            let store_guard = self.store.lock().unwrap();
            store_guard.get_pages()?
        };
        let mut wtr = self.index.writer(1024 * 1024 * 128).unwrap();

        wtr.delete_all_documents()?;

        let schema = self.index.schema();
        let name = schema.get_field(NAME_FIELD).unwrap();
        let content = schema.get_field(CONTENT_FIELD).unwrap();

        let mut count = 0;
        for page in pages {
            wtr.add_document(doc!(
                name => page.name,
                content => page.content
            ));
            count += 1;
        }

        wtr.commit().unwrap();
        wtr.wait_merging_threads().unwrap();

        info!("Indexed {} pages", count);

        Ok(())
    }
}

impl Actor for SearchActor {
    type Context = SyncContext<Self>;

    fn started(&mut self, ctx: &mut SyncContext<Self>) {
        info!("Started SearchActor");
        if let Err(err) = self.reindex() {
            error!("Error during initial reindex: {:?}", err);
        }
    }

    fn stopped(&mut self, ctx: &mut SyncContext<Self>) {
        info!("Stopped SearchActor");
    }
}

impl Handler<Reindex> for SearchActor {
    type Result = ();

    fn handle(&mut self, msg: Reindex, ctx: &mut SyncContext<Self>) -> Self::Result {
        info!("Reindex message received");
        if let Err(err) = self.reindex() {
            error!("Error during reindex: {:?}", err);
        };
    }
}

impl Handler<Search> for SearchActor {
    type Result = anyhow::Result<Vec<SearchResult>>;

    fn handle(&mut self, msg: Search, ctx: &mut SyncContext<Self>) -> Self::Result {
        let reader = self.index.reader().unwrap();
        let searcher = reader.searcher();
        let schema = self.index.schema();

        let name_field = schema.get_field(NAME_FIELD).unwrap();
        let content_field = schema.get_field(CONTENT_FIELD).unwrap();

        let query_parser = tantivy::query::QueryParser::for_index(&self.index, vec![name_field, content_field]);
        let query = query_parser.parse_query(msg.query.as_str())?;

        let top_docs: Vec<(tantivy::Score, tantivy::DocAddress)> =
            searcher.search(&query, &tantivy::collector::TopDocs::with_limit(10))?;

        let mut results = Vec::<SearchResult>::with_capacity(top_docs.len());
        let mut name_snippet_generator = SnippetGenerator::create(&searcher, &query, name_field)?;
        name_snippet_generator.set_max_num_chars(SNIPPET_MAX_NUM_CHARS);
        let mut content_snippet_generator = SnippetGenerator::create(&searcher, &query, content_field)?;
        content_snippet_generator.set_max_num_chars(SNIPPET_MAX_NUM_CHARS);
        for (_score, doc_address) in top_docs {
            // Retrieve the actual content of documents given its `doc_address`.
            let retrieved_doc = searcher.doc(doc_address)?;
            let name = retrieved_doc
                .get_first(name_field)
                .ok_or(anyhow!("Expected name field"))?
                .text()
                .ok_or(anyhow!("Expected name to be text"))?;
            let content = retrieved_doc
                .get_first(content_field)
                .ok_or(anyhow!("Expected content field"))?
                .text()
                .ok_or(anyhow!("Expected content to be text"))?;
            let result = SearchResult {
                name_field: SearchResultField::create(
                    &retrieved_doc,
                    name_field,
                    &name_snippet_generator
                )?,
                content_field: SearchResultField::create(
                    &retrieved_doc,
                    content_field,
                    &content_snippet_generator
                )?,
            };
            results.push(result);
        }

        Ok(results)
    }
}
