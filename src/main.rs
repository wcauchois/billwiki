use std::error::Error;
use std::fs;
use std::path::Path;

fn build_tantivy_index() {
    use tantivy::doc;
    use tantivy::{schema::*, tokenizer::*, Document, Index};

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

    wtr.prepare_commit().unwrap();
    wtr.commit().unwrap();
    wtr.wait_merging_threads().unwrap();
    drop(index);
}

fn main() -> Result<(), Box<dyn Error>> {
    // let contents = fs::read_to_string("/tmp/rust-test.txt")?;
    // println!("contents are {}", contents);
    // println!("Hello, world!");
    build_tantivy_index();
    Ok(())
}
