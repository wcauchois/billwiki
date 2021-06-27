import { ApolloProvider } from '@apollo/client';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import { client } from './client';

import styles from "./App.module.scss";
import Page from './components/Page/Page';

function App() {
  return (
    <ApolloProvider client={client}>
      <div className={styles.container}>
        <BrowserRouter>
          <Switch>
            <Route exact path="/">
              <Redirect to="/Home" />
            </Route>
            <Route path="/:name([a-zA-Z0-9_\-/]+)" component={Page} />
          </Switch>
        </BrowserRouter>
      </div>
    </ApolloProvider>
  );
}

export default App;
