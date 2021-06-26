use actix::prelude::*;
use tantivy::doc;
use tantivy::{schema::*, tokenizer::*, Document, Index};

#[derive(Message)]
#[rtype(result = "()")]
pub struct Reindex;

pub struct SearchActor {}

impl Actor for SearchActor {
    type Context = SyncContext<Self>;

    fn started(&mut self, ctx: &mut SyncContext<Self>) {
        info!("Started SearchActor");
    }

    fn stopped(&mut self, ctx: &mut SyncContext<Self>) {
        info!("Stopped SearchActor");
    }
}

impl Handler<Reindex> for SearchActor {
    type Result = ();

    fn handle(&mut self, msg: Reindex, ctx: &mut SyncContext<Self>) -> Self::Result {
        info!("Reindex message received");
    }
}
