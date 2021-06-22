use std::error::Error;
use std::fs;
use std::path::Path;

use tantivy::doc;
use tantivy::{schema::*, tokenizer::*, Document, Index};

fn build_tantivy_index() {
    let text_indexing_options = TextFieldIndexing::default()
        .set_index_option(IndexRecordOption::WithFreqsAndPositions)
        .set_tokenizer("en_stem");

    let text_options = TextOptions::default()
        .set_indexing_options(text_indexing_options)
        .set_stored();

    let mut schema_bldr = SchemaBuilder::new();

    let title = schema_bldr.add_text_field("title", text_options.clone());
    let body = schema_bldr.add_text_field("body", text_options.clone());

    let schema = schema_bldr.build();

    let index_dir = Path::new("devindex");

    let index = Index::create_in_dir(&index_dir, schema.clone()).unwrap();

    let mut wtr = index.writer(1024 * 1024 * 128).unwrap();

    wtr.add_document(doc!(
        title => "hello world",
        body => "body body"
    ));

    wtr.add_document(doc!(
        title => "hello world",
        body => "i worked on food"
    ));

    wtr.prepare_commit().unwrap();
    wtr.commit().unwrap();
    wtr.wait_merging_threads().unwrap();

    let reader = index.reader().unwrap();

    let searcher = reader.searcher();

    let query_parser = tantivy::query::QueryParser::for_index(&index, vec![title, body]);

    // QueryParser may fail if the query is not in the right
    // format. For user facing applications, this can be a problem.
    // A ticket has been opened regarding this problem.
    let query = query_parser.parse_query("working").unwrap();

    // Perform search.
    // `topdocs` contains the 10 most relevant doc ids, sorted by decreasing scores...
    let top_docs: Vec<(tantivy::Score, tantivy::DocAddress)> = searcher.search(&query, &tantivy::collector::TopDocs::with_limit(10)).unwrap();

    for (_score, doc_address) in top_docs {
        // Retrieve the actual content of documents given its `doc_address`.
        let retrieved_doc = searcher.doc(doc_address).unwrap();
        println!("result:: {}", schema.to_json(&retrieved_doc));
    }

    // drop(index);
}

fn main() -> Result<(), Box<dyn Error>> {
    // let contents = fs::read_to_string("/tmp/rust-test.txt")?;
    // println!("contents are {}", contents);
    // println!("Hello, world!");
    build_tantivy_index();
    Ok(())
}
