# https://mherman.org/blog/dockerizing-a-react-app/
# https://shaneutt.com/blog/rust-fast-small-docker-image-builds/
FROM node:14.18.1 AS node-build

WORKDIR /app

COPY js/app/package.json ./
COPY js/app/yarn.lock ./
RUN yarn install

COPY js/app ./
RUN yarn build

# https://github.com/clux/muslrust
FROM clux/muslrust:1.54.0 AS rust-build

WORKDIR /app
COPY Cargo.toml ./
COPY Cargo.lock ./
COPY src src
RUN mkdir -p js/app
COPY --from=node-build /app/build js/app/build
RUN cargo build --release --target=x86_64-unknown-linux-musl

FROM alpine:latest
WORKDIR /app
COPY --from=rust-build /app/target/x86_64-unknown-linux-musl/release/billwiki ./
ENTRYPOINT ["/app/billwiki"]
