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

// make `.jsx` file requirable by node
require('babel/register');

var path = require('path');
var express = require('express');
var renderer = require('react-engine');

var app = express();

// create the view engine with `react-engine`
var engine = renderer.server.create({
  routes: require(path.join(__dirname, '/public/routes.jsx')),
  routesFilePath: path.join(__dirname, '/public/routes.jsx'),
  page404: require(path.join(__dirname, '/public/views/404.jsx'))
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

// match everything and work from there
app.use('/', function(req, res, next) {
  var model = {
    title: 'React Engine Express Sample App',
    name: 'Jordan'
  };

  if (req.originalUrl === '/messages') {
    model.name = 'Messages';
    model.messages = [
      {id: 1, text: 'Lorem'},
      {id: 2, text: 'Ipsum'},
      {id: 3, text: 'Dolor'}
    ];
  }

  // hack to ignore favicon.ico
  if (req.originalUrl !== '/favicon.ico') {
    return res.render(req.originalUrl, model);
  }

  next();
});

var server = app.listen(3000, function() {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
