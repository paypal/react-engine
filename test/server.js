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

var fs = require('fs');
var path = require('path');
var test = require('tape');
var express = require('express');
var cheerio = require('cheerio');
var renderer = require('../index').server;
var assertions = require('./fixtures/assertions');

var DATA_MODEL = {
  title: 'Hello, world!',
  name: 'Joshua'
};

// helpers
function inject(path, callback) {
  var req = require('http').request({ method: 'GET', port: 8888, path: path }, function(res) {
    var data = [];

    res.on('data', function(chunk) {
      data.push(chunk);
    });

    res.on('end', function() {
      var body = Buffer.concat(data).toString('utf8');
      if (res.statusCode !== 200) {
        callback(new Error(body));
        return;
      }

      callback(null, body);
    });

  });

  req.on('error', callback);
  req.end();
}

function setup(options) {

  var setupEngine = options.engine;
  var expressRoutes = options.expressRoutes;
  var cb = options.onSetup;

  var app = express();

  if (!expressRoutes) {
    expressRoutes = function(req, res) {
      res.render(req.path.substr(1), DATA_MODEL);
    };
  }

  app.engine('js', setupEngine);
  app.set('view engine', 'js');
  app.set('view cache', false);
  app.set('views', path.resolve(__dirname, 'fixtures/views'));

  app.set('view', require('../lib/expressView'));

  if (!!options.production) {
    app.set('env', 'production');
  }

  app.get('/*', expressRoutes);

  var server = app.listen(8888, function() {
    cb(function(t) {
      server.once('close', function() {
        t.end();
      });

      server.close();
    });
  });
}

// start of test definitions
test('construct an engine', function(t) {
  var engine = renderer.create();
  t.ok(engine instanceof Function);
  t.end();
});

test('rendering a react view', function(t) {
  var options = {
    engine: renderer.create(),
    onSetup: function(done) {
      inject('/profile', function(err, data) {
        t.error(err);
        var $ = cheerio.load(data);
        $('*').removeAttr('data-reactid').removeAttr('data-react-checksum');
        t.strictEqual($.html(), assertions.PROFILE_OUTPUT);
        done(t);
      });
    }
  };
  setup(options);
});

test('all views get cleared from require cache in dev mode', function(t) {
  var options = {
    engine: renderer.create(),
    onSetup: function(done) {
      inject('/profile', function(err) {
        t.error(err);
        var viewsDir = path.resolve(__dirname, 'fixtures/views');
        var viewFiles = fs.readdirSync(viewsDir);
        viewFiles.map(function(file) {
          var view = path.resolve(viewsDir, file);
          t.strictEqual(require.cache[view], undefined);
        });

        done(t);
      });
    }
  };
  setup(options);
});

test('all views get cleared from require cache ONLY in dev mode', function(t) {
  var options = {
    production: true,
    engine: renderer.create(),
    onSetup: function(done) {
      inject('/profile', function(err) {
        t.error(err);
        var viewsDir = path.resolve(__dirname, 'fixtures/views');
        var viewFiles = fs.readdirSync(viewsDir);
        viewFiles.some(function(file) {
          var view = path.resolve(viewsDir, file);
          return require.cache[view] !== undefined;
        });

        t.notEqual(viewFiles.length, 0);
        done(t);
      });
    }
  };
  setup(options);
});

test('router gets run when we pass urls into render function', function(t) {

  var options = {
    engine: renderer.create({
      reactRoutes: path.join(__dirname + '/fixtures/reactRoutes')
    }),
    expressRoutes: function(req, res) {
      res.render(req.url, DATA_MODEL);
    },

    onSetup: function(done) {
      inject('/account', function(err, data) {
        t.error(err);
        var $ = cheerio.load(data);
        $('*').removeAttr('data-reactid').removeAttr('data-react-checksum');
        t.strictEqual($.html(), assertions.ACCOUNT_OUTPUT);
        done(t);
      });
    }
  };
  setup(options);
});

test('error that renderer throws when asked to run react router without providing a react-router route', function(t) {

  var options = {
    engine: renderer.create(),
    expressRoutes: function(req, res) {
      res.render(req.url, DATA_MODEL);
    },

    onSetup: function(done) {
      inject('/account', function(err, data) {
        var errorMessage = err.message;
        var matchIndex = errorMessage.indexOf('asking to use react router for rendering, but no routes are provided');
        t.notEqual(matchIndex, -1);
        t.ok(typeof data === 'undefined');
        done(t);
      });
    }
  };
  setup(options);
});
