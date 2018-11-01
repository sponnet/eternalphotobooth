// Import React and Component
import React, { Component } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import "bulma/css/bulma.css";
import "./App.css";
import Home from "./Home/Home";
import Error from "./Error/Error";
import Gallery from "./Gallery/Gallery";
import Shuffle from "./Shuffle/Shuffle";
import config from "react-global-configuration";
import configuration from "./config";

config.set(configuration);

class App extends Component {
  render() {
    return (
     
      <BrowserRouter>
        <Switch>
          <Route path="/" render={props => <Home {...props} />} exact />
          <Route path="/view" render={props => <Gallery {...props} />} exact />
          <Route path="/shuffle" render={props => <Shuffle {...props} />} exact />
          <Route component={Error} />
        </Switch>
      </BrowserRouter>
      
     
    );
  }
}

export default App;
