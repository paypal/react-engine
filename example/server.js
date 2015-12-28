'use strict';

const PORT = 3000;

import {join} from 'path';
import express from 'express';
import favicon from 'serve-favicon';
import renderer from 'react-engine';
import movies from './movies.json';
import routes from './public/routes.jsx';

let app = express();

// create the view engine with `react-engine`
let engine = renderer.server.create({
  routes: routes,
  routesFilePath: join(__dirname, '/public/routes.jsx')
});

// set the engine
app.engine('.jsx', engine);

// set the view directory
app.set('views', join(__dirname, '/public/views'));

// set jsx as the view engine
app.set('view engine', 'jsx');

// finally, set the custom view
app.set('view', renderer.expressView);

// expose public folder as static assets
app.use(express.static(join(__dirname, '/public')));

app.use(favicon(join(__dirname, '/public/favicon.ico'))); 

// add the our app routes
app.get('*', function(req, res) {
  res.render(req.url, {
    movies: movies
  });
});

const server = app.listen(PORT, function() {
  console.log('Example app listening at http://localhost:%s', PORT);
});
