import React from "react";
import ReactDOM from "react-dom";
import App from "components/App";
import  { BrowserRouter } from "react-router-dom";
import './components/App.scss'

ReactDOM.render(
<BrowserRouter>
  <App />
</BrowserRouter>, document.querySelector("#App"));
