mod schema;
mod store;

use crate::schema::{create_schema, Schema};

#[macro_use]
extern crate log;

use std::error::Error;
use std::fs;
use std::path::Path;

use tantivy::doc;
use tantivy::{schema::*, tokenizer::*, Document, Index};

use std::io;
use std::sync::Arc;

use actix_cors::Cors;
use actix_web::{middleware, web, App, HttpResponse, HttpServer};
use juniper::http::graphiql::graphiql_source;
use juniper::http::GraphQLRequest;

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
    let top_docs: Vec<(tantivy::Score, tantivy::DocAddress)> = searcher
        .search(&query, &tantivy::collector::TopDocs::with_limit(10))
        .unwrap();

    for (_score, doc_address) in top_docs {
        // Retrieve the actual content of documents given its `doc_address`.
        let retrieved_doc = searcher.doc(doc_address).unwrap();
        println!("result:: {}", schema.to_json(&retrieved_doc));
    }

    // drop(index);
}

const PORT: u16 = 3010;

async fn graphiql() -> HttpResponse {
    let html = graphiql_source(format!("http://127.0.0.1:{}/graphql", PORT).as_str(), None);
    HttpResponse::Ok()
        .content_type("text/html; charset=utf-8")
        .body(html)
}

async fn graphql(
    st: web::Data<Arc<Schema>>,
    data: web::Json<GraphQLRequest>,
) -> Result<HttpResponse, actix_web::Error> {
    let body = web::block(move || {
        let res = data.execute_sync(&st, &());
        Ok::<_, serde_json::error::Error>(serde_json::to_string(&res)?)
    })
    .await?;
    Ok(HttpResponse::Ok()
        .content_type("application/json")
        .body(body))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    std::env::set_var("RUST_LOG", "info");
    env_logger::init();

    info!("Starting server on port {}", PORT);

    let schema = std::sync::Arc::new(create_schema());

    HttpServer::new(move || {
        App::new()
            .data(schema.clone())
            .wrap(middleware::Logger::default())
            .wrap(
                Cors::default()
                    .allowed_methods(vec!["POST", "GET"])
                    .allowed_header(actix_web::http::header::CONTENT_TYPE)
                    .allow_any_origin()
                    .supports_credentials()
                    .max_age(3600)
            )
            .service(web::resource("/graphql").route(web::post().to(graphql)))
            .service(web::resource("/graphiql").route(web::get().to(graphiql)))
    })
    .bind("127.0.0.1:3010")? // TODO: Use PORT
    .run()
    .await
    // let contents = fs::read_to_string("/tmp/rust-test.txt")?;
    // println!("contents are {}", contents);
    // println!("Hello, world!");
    // build_tantivy_index();
    // let store = store::Store::new("devwiki")?;
    // store.pages();
}
