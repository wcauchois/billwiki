use crate::search_actor::{Reindex, Search, SearchActor, SearchResult};
use juniper::FieldResult;
use juniper::{EmptySubscription, RootNode};
use std::sync::{Arc, Mutex};

// Some inspo: https://gist.github.com/monorkin/c463f34764ab23af2fd0fb0c19716177
#[derive(Clone)]
pub struct SearchActorAddr(pub Arc<Mutex<actix::Addr<SearchActor>>>);

pub struct GraphQLContext {
    pub search_actor_addr: SearchActorAddr,
}

impl juniper::Context for GraphQLContext {}

struct GraphQLSearchResult(SearchResult);

#[juniper::graphql_object]
impl GraphQLSearchResult {
    fn name(&self) -> &str {
        self.0.name.as_str()
    }

    fn content(&self) -> &str {
        self.0.content.as_str()
    }
}

pub struct QueryRoot;
pub struct MutationRoot;

#[juniper::graphql_object(context = GraphQLContext)]
impl QueryRoot {
    async fn search(
        context: &GraphQLContext,
        query: String,
    ) -> FieldResult<Vec<GraphQLSearchResult>> {
        let addr = context.search_actor_addr.0.lock()?.downgrade();
        let raw_results = addr.upgrade().unwrap().send(Search::new(query)).await??;
        Ok(raw_results
            .into_iter()
            .map(|r| GraphQLSearchResult(r))
            .collect())
    }
}

#[juniper::graphql_object(context = GraphQLContext)]
impl MutationRoot {
    async fn reindex(context: &GraphQLContext) -> FieldResult<bool> {
        let addr = context.search_actor_addr.0.lock()?.downgrade();
        addr.upgrade().unwrap().send(Reindex).await?;
        Ok(true)
    }
}

pub type Schema = RootNode<'static, QueryRoot, MutationRoot, EmptySubscription<GraphQLContext>>;

pub fn create_schema() -> Schema {
    Schema::new(QueryRoot, MutationRoot, EmptySubscription::new())
}
