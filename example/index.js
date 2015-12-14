/*-------------------------------------------------------------------------------------------------------------------*\
|  Copyright (C) 2015 PayPal                                                                                          |
|                                                                                                                     |
|  Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance     |
|  with the License.                                                                                                  |
|                                                                                                                     |
|  You may obtain a copy of the License at                                                                            |
|                                                                                                                     |
|       http://www.apache.org/licenses/LICENSE-2.0                                                                    |
|                                                                                                                     |
|  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed   |
|  on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for  |
|  the specific language governing permissions and limitations under the License.                                     |
\*-------------------------------------------------------------------------------------------------------------------*/

'use strict';

// auto-magically transforms `.jsx` files and files with ES6 code
require('babel/register');

var PORT = 3000;
var path = require('path');
var express = require('express');
var renderer = require('react-engine');
var expressRoutes = require('./routes/express');

var app = express();

// create the view engine with `react-engine`
var reactRoutesFilePath = path.join(__dirname + '/routes/react-router.jsx');

var engine = renderer.server.create({
  routes: require(reactRoutesFilePath),
  routesFilePath: reactRoutesFilePath
});

// set the engine
app.engine('.jsx', engine);

// set the view directory
app.set('views', path.join(__dirname, '/public/views'));

// set jsx as the view engine
app.set('view engine', 'jsx');

// finally, set the custom view
app.set('view', renderer.expressView);

//expose public folder as static assets
app.use(express.static(path.join(__dirname, '/public')));

// add the our app routes
app.use('/', expressRoutes);

// 404 handler
app.use(function(req, res) {
  res.render('404', {
    url: req.url
  });
});

// 500 handler
app.use(function(err, req, res, next) {
  res.render('500', {
    err: err
  });
});

var server = app.listen(PORT, function() {
  console.log('Example app listening at http://localhost:%s', PORT);
});
