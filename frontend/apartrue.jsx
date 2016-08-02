import { Router, Route, IndexRoute, Link, hashHistory } from 'react-router';

const ReactDOM = require('react-dom'),
      React = require('react'),
      LoginForm = require('./components/login_form');


const App = React.createClass ({
  render () {
    return (
      <div>
        hello world
        {this.props.children}
      </div>
    );
  }
});

const routes = (
  <Router history={ hashHistory }>
    <Route path="/" component={ App } >
      <Route path="session" component={LoginForm}/>
    </Route>
  </Router>
)

document.addEventListener("DOMContentLoaded", () => {
  let root = document.getElementById('content');
  ReactDOM.render(routes, root);
});