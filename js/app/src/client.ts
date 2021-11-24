import { ApolloClient, InMemoryCache } from "@apollo/client";

export const client = new ApolloClient({
  uri: process.env.REACT_APP_GRAPHQL_ENDPOINT ?? "/graphql",
  cache: new InMemoryCache(),
});
