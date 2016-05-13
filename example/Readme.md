# react-engine example app
This movie catalog app illustrates the usage of react-engine to build and run an universal/isomorphic app.

## app composition
* [express - 4.x](https://github.com/strongloop/express) on the server side
* [react-engine - 3.x](https://github.com/paypal/react-engine) as the express view render engine
* [react - 0.14.x](https://github.com/facebook/react) for building the UI
* [react-router - 2.x](https://github.com/rackt/react-router) for UI routing
* [webpack - 1.x](https://github.com/webpack/webpack) as the client side module loader
* [babel - 6.x](https://github.com/babel/babel) for compiling the ES6/JSX code

## tl;dr - to run the example
```shell
# cd `into_this_dir`
$ npm install
$ npm start # or `npm run dev`
$ open http://localhost:3000
```

## step by step walkthrough to build the app

### step 1
```shell
  # let us start by installing the dependencies for our app
  # create a npm manifest
  # (fill out the needed information like name, author, etc..)
  $ npm init

  # install express, react, react-router (optional) & react-engine
  $ npm install express react-engine react@0.14 react-router --save

  # install the rest of the dependencies
  $ npm install babel-register babel-preset-react webpack --save

  # we are going to use a static json file that contains
  # an array of movie information as the data source for
  # our movie catalog app
  $ touch movies.json
  # copy the contents for this file from http://bit.ly/1NOU4nk
```

### step 2
```shell
  # next, let us build the client side of our app
  # create a directory called public and inside that
  # create the client side index file
  $ mkdir public
  $ touch public/index.js

  # create a directory called views to hold all the view files
  # also create a client side routes file to hold the react-router routes
  $ mkdir public/views
  $ touch public/routes.jsx

  # setup the client side react-engine inside public/index.js
  # instructions: https://github.com/paypal/react-engine#usage-on-client-side-mounting
  # public/index.js code for our app can be found here - http://bit.ly/1Y8DOEh
```

### step 3
```javascript
  // since we are building a movie catalog app, let us plan to have two UI pages.
  // 1. list page - to list the catalog of movies
  // 2. detail page - to show the detailed description of a movie

  // lets start building the react-router route file (public/routes.jsx)
  // keeping in mind the above requirements
  var Layout = require('./views/layout.jsx');
  var ListPage = require('./views/list.jsx');
  var DetailPage = require('./views/detail.jsx');

  var routes = module.exports = (
    <Router>
      <Route path='/' component={Layout}>
        <IndexRoute component={ListPage} />
        <Route path='/movie/:id' component={DetailPage} />
        <Redirect from='/gohome' to='/' />
      </Route>
    </Router>
  );
```

### step 4
```shell
  # next, lets build the actual UI inside the pages
  # create the below three files inside the public/views directory
  $ touch public/views/layout.jsx
  $ touch public/views/list.jsx
  $ touch public/views/detail.jsx
```

```javascript
  // public/views/layout.jsx file contains the main parts of the app
  // such as html, body and script tags.
  module.exports = React.createClass({
    render: function render() {
      return (
        <html>
          <head>
            <meta charSet='utf-8' />
            <title>React Engine Example App</title>
            <link rel='stylesheet' href='/styles.css'></link>
          </head>
          <body>
            <div>
              {/* Router now automatically populates this.props.children of your components based on the active route. https://github.com/rackt/react-router/blob/latest/CHANGES.md#routehandler */}
              {this.props.children}
            </div>
            <script src='/bundle.js'></script>
          </body>
        </html>
      );
    }
  });

  // public/views/list.jsx file contains the catalog view elements of our app.
  // we iterate through the array of movies and display them on this page.
  module.exports = React.createClass({
    render: function render() {
      return (
        <div id='list'>
          <h1>Movies</h1>
          <h6>Click on a movie to see the details</h6>
          <ul>
            {this.props.movies.map(function(movie) {
              return (
                <li key={movie.id}>
                  <Router.Link to={'/movie/' + movie.id}>
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

  // public/views/detail.jsx file contains the markup to
  // display the detail information of a movie
  module.exports = React.createClass({
    render: function render() {
      var movieId = this.props.params.id;
      var movie = this.props.movies.filter(function(_movie) {
        return _movie.id === movieId;
      })[0];

      return (
        <div id='detail'>
          <h1>{movie.title}</h1>
          <img src={movie.image} alt={movie.title} />
          <a href={movie.url} target='_blank'>more info</a>
        </div>
      );
    }
  });
```

### step 5
```shell
  # next, lets add the server side file
  $ touch index.js
```

```javascript
  // start by configuring Babel at the top
  // this takes care of parsing JSX files and also ES6 code
  require('babel-register')({
    presets: ['react']
  });

  // next, lets create the express app
  var express = require('express');
  var renderer = require('react-engine');
  var app = express();

  // then create the view engine for our express app
  var reactRoutesFilePath = path.join(__dirname + '/public/routes.jsx');
  var engine = renderer.server.create({
    routes: require(reactRoutesFilePath),
    routesFilePath: reactRoutesFilePath
  });

  // then configure our express app with the view engine that we created
  // set the engine
  app.engine('.jsx', engine);
  // set the view directory
  app.set('views', path.join(__dirname, '/public/views'));
  // set jsx as the view engine
  app.set('view engine', 'jsx');
  // finally, set the custom view
  app.set('view', renderer.expressView);

  // next, lets configure the routes for the express app
  // expose public folder as static assets (JS/CSS)
  app.use(express.static(path.join(__dirname, '/public')));
  // add the our app routes
  // we open a free pass to all GET requests to our app and use react-engine to render them
  app.get('*', function(req, res) {
    res.render(req.url, {
      movies: require('./movies.json')
    });
  });

  // add the error handler middleware
  app.use(function(err, req, res, next) {
    console.error(err);

    // http://expressjs.com/en/guide/error-handling.html
    if (res.headersSent) {
      return next(err);
    }

    if (err._type && err._type === ReactEngine.reactRouterServerErrors.MATCH_REDIRECT) {
      return res.redirect(302, err.redirectLocation);
    }
    else if (err._type && err._type === ReactEngine.reactRouterServerErrors.MATCH_NOT_FOUND) {
      return res.status(404).send('Route Not Found!');
    }
    else {
      // for ReactEngine.reactRouterServerErrors.MATCH_INTERNAL_ERROR or
      // any other error we just send the error message back
      return res.status(500).send(err.message);
    }
  });

  // the last step in the server side is to configure the express app to listen on port 3000
  app.listen(3000, function() {
    console.log('Example app listening at http://localhost:%s', PORT);
  });

  // the consolidated full code for this file can be
  // found here: http://bit.ly/1MdzR5c
```

### step 6
```shell
  # finally, lets configure webpack, our client side module loader
  # we need two webpack loaders for our app
  # 1. babel-loader for webpack to load jsx and es6 code
  # 2. json-loader for webpack to load json files
  $ npm install babel-loader json-loader --save

  # next, add a webpack configuration file
  $ touch webpack.config.js

  # configure webpack to build a bundle.js file using public/index.js as the main file
  #  module.exports = {
  #
  #    entry: __dirname + '/public/index.js',
  #
  #    output: {
  #      path: __dirname + '/public',
  #      filename: 'bundle.js'
  #    },
  #
  #    module: {
  #      loaders: [
  #          {
  #            test: /\.jsx?$/,
  #            exclude: /node_modules/,
  #            loader: 'babel?presets[]=react'
  #          },
  #          {
  #            test: /\.json$/,
  #            loader: 'json-loader'
  #          }
  #      ]
  #    },
  #
  #    resolve: {
  #      extensions: ['', '.js', '.jsx', '.json']
  #    }
  #  };
```

### step 7
```shell
  # modify the public/views/layout.jsx file to add the bundle.js into it
  # <script src='/bundle.js'></script>

  # also lets add a start script to our package.json to build our client code using webpack and then start the app
  #  "scripts": {
  #    "start": "webpack && node index.js"
  #  }

  # now that we are done with the app,
  # lets start the app and launch http://localhost:3000 in a browser
  $ npm start
```

### misc
```shell
  # to beautify our movie catalog app we are going to add some css
  # modify the public/views/layout.jsx file to add the styles.css into it
  # <link rel='stylesheet' href='/styles.css'></link>
  $ touch public/styles.css
  # copy the contents for this file from http://bit.ly/1m2co1B
```
