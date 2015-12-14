# react-engine example app
This movie catalog app illustrates the usage of react-engine to build and run an universal/isomorphic app.

## app composition
* [express - 4.x](https://github.com/strongloop/express) on the server side
* [react-engine - 2.x](https://github.com/paypal/react-engine) as the express view render engine
* [react - 0.13.x](https://github.com/facebook/react) for building the UI
* [react-router - 0.13.x](https://github.com/rackt/react-router) for UI routing
* [webpack - 1.x](https://github.com/webpack/webpack) as the client side module loader
* [babel - 6.x](https://github.com/babel/babel) for compiling the ES6 JS code

## to run the example
```shell
# cd `into_this_dir`
$ npm install
$ npm start
$ open http://localhost:3000
```

## step by step walkthrough to build the app

### step 1
```shell
  # let us start by installing the dependencies for our app
  # create a npm manifest
  # (fill out the needed information like name, author, etc..)
  $ npm init

  # install express, react, react-router & react-engine
  $ npm install express react-engine@2 react@0.13 react-router@0.13 --save

  # install the rest of the dependencies
  $ npm install babel-register webpack --save

  # we are going to use a static json file that contains an array of movie information as the data source for our movie catalog app
  $ touch movies.json (the contents for this file can be found here: http://sam)
```

### step 2.1
```shell
  # next, let us build the client side of our app
  # create a directory called public and the client side index file
  $ mkdir public
  $ touch public/index.js

  # create a directory called views to hold all the view files and a client side routes file to hold the react-router routes
  $ mkdir public/views
  $ touch public/routes.jsx

  # setup the client side react-engine inside public/index.js
  # instructions: https://github.com/paypal/react-engine#usage-on-client-side-mounting
  # public/index.js code for our app can be found here - http://bit.ly/1Y8DOEh
```

### step 2.2
```javascript
  // since we are building a movie catalog app, let us plan to have two UI pages.
  // 1. list page - to list catalog of movies
  // 2. detail page - to show the detailed description of a movie

  // lets start building the react-router route file keeping in mind the above requirements
  // (public/routes.jsx file contents)
  var Layout = require('./views/layout.jsx');
  var ListPage = require('./views/list.jsx');
  var DetailPage = require('./views/detail.jsx');

  var routes = module.exports = (
    <Router.Route path='/' handler={Layout}>
      <Router.DefaultRoute name='list' handler={ListPage} />
      <Router.Route name='detail' path='/:id' handler={DetailPage} />
    </Router.Route>
  );
```

### step 2.3
```shell
  # next, lets build the actual UI inside the pages
  # create the below three files inside the public/views directory
  $ touch public/views/layout.jsx
  $ touch public/views/list.jsx
  $ touch public/views/detail.jsx
```

```javascript
  // public/views/layout.jsx file contains the main parts of the app such as html, body and script tags.
  module.exports = React.createClass({
    render: function render() {
      return (
        <html>
          <head>
            <meta charSet='utf-8' />
            <title>React Engine Example App</title>
          </head>
          <body>
            <div>
              {/* Component that renders the active child route handler of a parent route handler component. */}
              <Router.RouteHandler {...this.props} />
            </div>
          </body>
        </html>
      );
    }
  });  

  // public/views/list.jsx file contains the catalog view elements of our app.
  // we iterate through the array of movies
  module.exports = React.createClass({
    render: function render() {
      return (
        <div id='list'>
          <h1>Movies</h1>
          <h6>Click on a movie to see the details</h6>
          <ul>
            {this.props.movies.map(function(movie) {
              return (
                <li>
                  <Router.Link to='detail' params={{id: movie.id}}
                    <img src={movie.image} alt={movie.title} />
                  </Router.Link>
                </li>
              );
            })}
          </ul>
        </div>
      );
    }
  });

  // public/views/detail.jsx file contains the markup to display the detail information of a movie
  module.exports = React.createClass({
    mixins: [Router.State],
    render: function render() {
      var movieId = this.getParams().id;
      var movie = this.props.movies.find(function(_movie) {
        return _movie.id === movieId;
      });
      return (
        <div id='detail'>
          <h1>{movie.title}</h1>
          <img src={movie.image} alt={movie.title} />
          <h3>{movie.url}</h3>
        </div>
      );
    }
  });  
```


http://bit.ly/1P2aM1H

<link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/materialize/0.97.0/css/materialize.min.css' />

<script src='/bundle.js'></script>
{this.props.children}
