mod schema;
mod search_actor;
mod store;

use crate::schema::{create_schema, Schema};
use crate::store::Store;

#[macro_use]
extern crate log;

use actix::prelude::*;
use actix_cors::Cors;
use actix_web::{body::Body, middleware, web, App, HttpResponse, HttpServer};
use juniper::http::graphiql::graphiql_source;
use juniper::http::GraphQLRequest;
use mime_guess::from_path;
use rust_embed::RustEmbed;
use std::borrow::Cow;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use structopt::StructOpt;

const PORT: u16 = 3010;

async fn graphiql() -> HttpResponse {
    let html = graphiql_source(format!("http://127.0.0.1:{}/graphql", PORT).as_str(), None);
    HttpResponse::Ok()
        .content_type("text/html; charset=utf-8")
        .body(html)
}

async fn graphql(
    st: web::Data<Arc<Schema>>,
    graphql_request: web::Json<GraphQLRequest>,
    search_actor_addr: web::Data<schema::SearchActorAddr>,
    store: web::Data<Arc<Mutex<Store>>>,
) -> Result<HttpResponse, actix_web::Error> {
    let graphql_context = schema::GraphQLContext {
        search_actor_addr: schema::SearchActorAddr::clone(&search_actor_addr),
        store: (*store.into_inner()).clone(),
    };
    let res = graphql_request.execute(&st, &graphql_context).await;
    let body = serde_json::to_string(&res)?;
    Ok(HttpResponse::Ok()
        .content_type("application/json")
        .body(body))
}

#[derive(RustEmbed)]
#[folder = "js/app/build/"]
struct Asset;

fn handle_embedded_file(path: &str) -> HttpResponse {
    match Asset::get(path) {
        Some(content) => {
            let body: Body = match content {
                Cow::Borrowed(bytes) => bytes.into(),
                Cow::Owned(bytes) => bytes.into(),
            };
            HttpResponse::Ok()
                .content_type(from_path(path).first_or_octet_stream().as_ref())
                .body(body)
        }
        None if path != "index.html" => handle_embedded_file("index.html"),
        None => HttpResponse::NotFound().body("404 Not Found"),
    }
}

fn index() -> HttpResponse {
    handle_embedded_file("index.html")
}

fn dist(path: web::Path<String>) -> HttpResponse {
    handle_embedded_file(&path.0)
}

#[derive(StructOpt, Debug)]
#[structopt()]
struct Opt {
    /// Port for the server to listen on.
    #[structopt(short = "P", long, default_value = "3010", env = "PORT")]
    port: u32,

    /// Path to a bare Git repository on the filesystem.
    #[structopt(short, long, parse(from_os_str))]
    path: PathBuf,
}

#[actix_web::main]
async fn main() -> anyhow::Result<()> {
    std::env::set_var("RUST_LOG", "info");
    env_logger::init();

    let opt = Opt::from_args();

    info!("Access the application at http://localhost:{}", opt.port);

    let store = Arc::new(Mutex::new(Store::new(&opt.path)?));
    let schema = Arc::new(create_schema());
    let system = actix::System::new();

    system.block_on(async {
        let search_actor_addr = {
            let store = store.clone();
            let addr = SyncArbiter::start(1, move || {
                search_actor::SearchActor::new(Arc::clone(&store)).unwrap()
            });
            Arc::new(Mutex::new(addr))
        };

        let server = HttpServer::new(move || {
            App::new()
                .data(schema.clone())
                .data(store.clone())
                .wrap(middleware::Logger::default())
                .data(schema::SearchActorAddr(search_actor_addr.clone()))
                .wrap(
                    Cors::default()
                        .allowed_methods(vec!["POST", "GET"])
                        .allowed_header(actix_web::http::header::CONTENT_TYPE)
                        .allow_any_origin()
                        .supports_credentials()
                        .max_age(3600),
                )
                .service(web::resource("/graphql").route(web::post().to(graphql)))
                .service(web::resource("/graphiql").route(web::get().to(graphiql)))
                .service(web::resource("/").route(web::get().to(index)))
                .service(web::resource("/{_:.*}").route(web::get().to(dist)))
        })
        .bind(format!("0.0.0.0:{}", opt.port))?
        .run();

        server.await.unwrap();
        Ok(())
    })
}
