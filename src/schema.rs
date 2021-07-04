use crate::search_actor::{Reindex, Search, SearchActor, SearchResult};
use crate::store::{Page, Store};
use juniper::FieldResult;
use juniper::{EmptySubscription, RootNode};
use std::sync::{Arc, Mutex};

// Some inspo: https://gist.github.com/monorkin/c463f34764ab23af2fd0fb0c19716177
#[derive(Clone)]
pub struct SearchActorAddr(pub Arc<Mutex<actix::Addr<SearchActor>>>);

pub struct GraphQLContext {
    pub search_actor_addr: SearchActorAddr,
    pub store: Arc<Mutex<Store>>,
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

struct GraphQLPage(Page);


#[juniper::graphql_object]
impl GraphQLPage {
    fn id(&self) -> &str {
        self.0.name.as_str()
    }

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

    async fn page(
        context: &GraphQLContext,
        name: String,
    ) -> FieldResult<GraphQLPage> {
        let page = context.store.lock().unwrap().get_page(name.as_str())?;
        Ok(GraphQLPage(page))
    }
}

#[derive(juniper::GraphQLInputObject)]
struct PageInput {
    name: String,
    content: String
}

#[juniper::graphql_object(context = GraphQLContext)]
impl MutationRoot {
    async fn reindex(context: &GraphQLContext) -> FieldResult<bool> {
        let addr = context.search_actor_addr.0.lock()?.downgrade();
        addr.upgrade().unwrap().send(Reindex).await?;
        Ok(true)
    }

    async fn update(context: &GraphQLContext, input: PageInput) -> FieldResult<GraphQLPage> {
        {
            let store = context.store.lock().unwrap();
            store.update_page(input.name.as_str(), input.content.as_str())?;
        }

        {
            let addr = context.search_actor_addr.0.lock()?.downgrade();
            addr.upgrade().unwrap().send(Reindex).await?;
        }

        let updated_page = {
            let store = context.store.lock().unwrap();
            store.get_page(input.name.as_str())?
        };

        Ok(GraphQLPage(updated_page))
    }
}

pub type Schema = RootNode<'static, QueryRoot, MutationRoot, EmptySubscription<GraphQLContext>>;

pub fn create_schema() -> Schema {
    Schema::new(QueryRoot, MutationRoot, EmptySubscription::new())
}
