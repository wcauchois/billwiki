mod schema;
mod store;
mod search_actor;

use crate::schema::{create_schema, Schema};
use crate::store::Store;

#[macro_use]
extern crate log;

use std::sync::{Arc, Mutex};
use actix_cors::Cors;
use actix_web::{middleware, web, App, HttpResponse, HttpServer};
use juniper::http::graphiql::graphiql_source;
use juniper::http::GraphQLRequest;
use actix::prelude::*;

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
    search_actor_addr: web::Data<schema::SearchActorAddr>
) -> Result<HttpResponse, actix_web::Error> {
    let graphql_context = schema::GraphQLContext {
        search_actor_addr: schema::SearchActorAddr::clone(&search_actor_addr)
    };
    let res = graphql_request.execute(&st, &graphql_context).await;
    let body = serde_json::to_string(&res)?;
    Ok(HttpResponse::Ok()
        .content_type("application/json")
        .body(body))
}

#[actix_web::main]
async fn main() -> anyhow::Result<()> {
    std::env::set_var("RUST_LOG", "info");
    env_logger::init();

    info!("Starting server on port {}", PORT);

    let store = Arc::new(Mutex::new(Store::new("devwiki")?));
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
                .wrap(middleware::Logger::default())
                .data(schema::SearchActorAddr(search_actor_addr.clone()))
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
        .run();

        server.await.unwrap();
        Ok(())
    })
}
