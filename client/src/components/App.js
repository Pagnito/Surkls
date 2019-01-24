import React, { Component } from "react";
import { Route, withRouter } from "react-router-dom";
import { Provider } from 'react-redux';
import Store from '../store'
import Home from "./home"

/*const Loading = () => Loader;

const Entries = Loadable({
  loader: () => import('./entries'),
  loading: Loading(),
});*/

class App extends Component {
  constructor(props){
    super(props);
    this.state={
      user:{}
    }
  }

  

  render() {
    return (
      <Provider store={Store}>
          <Route
              exact
              path="/"
              render={props => <Home {...props} user={this.state.user} />}
            />
      </Provider>
    )
  }
}

export default withRouter(App);
