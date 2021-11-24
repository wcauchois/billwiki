import { ApolloProvider } from "@apollo/client";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import { client } from "./client";

import styles from "./App.module.scss";
import Page from "./components/Page";
import SearchResults from "./components/SearchResults";
import NewPage from "./components/NewPage";

function App() {
  return (
    <ApolloProvider client={client}>
      <div className={styles.container}>
        <BrowserRouter>
          <Switch>
            <Route exact path="/">
              <Redirect to="/wiki/Home" />
            </Route>
            <Route exact path="/search" component={SearchResults} />
            <Route exact path="/new" component={NewPage} />
            <Route path="/wiki/:name([a-zA-Z0-9_\-/]+)" component={Page} />
          </Switch>
        </BrowserRouter>
      </div>
    </ApolloProvider>
  );
}

export default App;
