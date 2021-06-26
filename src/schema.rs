use crate::search_actor::SearchActor;
use juniper::FieldResult;
use juniper::{EmptyMutation, EmptySubscription, RootNode};
use std::sync::{Arc, Mutex};

// Some inspo: https://gist.github.com/monorkin/c463f34764ab23af2fd0fb0c19716177
#[derive(Clone)]
pub struct SearchActorAddr(pub Arc<Mutex<actix::Addr<SearchActor>>>);

pub struct GraphQLContext {
    pub search_actor_addr: SearchActorAddr, //Arc<Mutex<actix::Addr<SearchActor>>>,
}

impl juniper::Context for GraphQLContext {}

pub struct QueryRoot;

#[juniper::graphql_object(context = GraphQLContext)]
impl QueryRoot {
    async fn human(context: &GraphQLContext, _id: String) -> FieldResult<i32> {
        {
            let guard = context.search_actor_addr.0.lock()?.downgrade();
            guard.upgrade().unwrap().send(crate::search_actor::Reindex).await.unwrap();
        }
        // context.search_actor_addr.0.lock()?.send(crate::search_actor::Reindex).await;
        Ok(42)
    }
}

pub type Schema = RootNode<'static, QueryRoot, EmptyMutation<GraphQLContext>, EmptySubscription<GraphQLContext>>;

pub fn create_schema() -> Schema {
    Schema::new(QueryRoot {}, EmptyMutation::new(), EmptySubscription::new())
}
