actix-web + juniper example:
https://gist.github.com/jkirkpatrick/bd795a515fe85c2def1c047fc1501ba9

some tracking issue related to above? https://github.com/graphql-rust/juniper/issues/149

## Stack (backend):

- libgit for rust: https://github.com/rust-lang/git2-rs
- juniper (graphql): https://github.com/graphql-rust/juniper
- tantivy (search): https://github.com/tantivy-search/tantivy
- actix-web
- rust-embed: https://crates.io/crates/rust-embed
- anyhow (error handling): https://crates.io/crates/anyhow
- serde / serde_json: JSON serialization for node process interop

## Stack (frontend):

- Create react app
- TypeScript
- remark (markdown parsing/AST): https://www.npmjs.com/package/remark 
- apollo client
- lerna

## Helpful resources

- Building a site search with tantivy: https://jstrong.dev/posts/2020/building-a-site-search-with-tantivy/

### random

https://github.com/teramotodaiki/remark-plain-text

future is not send diagnostic:
https://blog.rust-lang.org/inside-rust/2019/10/11/AsyncAwait-Not-Send-Error-Improvements.html

## docker image building

https://shaneutt.com/blog/rust-fast-small-docker-image-builds/