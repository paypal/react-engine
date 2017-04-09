/*-------------------------------------------------------------------------------------------------------------------*\
|  Copyright (C) 2017 PayPal                                                                                           |
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

require('babel-register')({
  presets: ['react']
});

var fs = require('fs');
var path = require('path');
var test = require('tape');
var express = require('express');
var cheerio = require('cheerio');
var renderer = require('../index').server;
var assertions = require('./fixtures/assertions.json');

var DATA_MODEL = exports.DATA_MODEL = {
  title: 'Hello, world!',
  name: 'Joshua',
  xss: '</script><script>alert("xss")</script>'
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

  app.engine('jsx', setupEngine);
  app.set('view engine', 'jsx');
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

function stripReactDataAttr($/*cheerio*/) {
  $('*').removeAttr('data-reactid').
    removeAttr('data-react-checksum').
    removeAttr('data-reactroot');
}

/*
  -------------------------
  start of test definitions
  -------------------------
*/

test('react-engine public api', function(t) {
  var index = require('../index');
  t.strictEqual(typeof index.server.create, 'function');
  t.strictEqual(typeof index.client.data, 'function');
  t.strictEqual(typeof index.client.boot, 'function');
  t.strictEqual(typeof index.expressView, 'function');
  t.strictEqual(typeof index.reactRouterServerErrors, 'object');
  t.strictEqual(index.reactRouterServerErrors.MATCH_REDIRECT, 'MATCH_REDIRECT');
  t.strictEqual(index.reactRouterServerErrors.MATCH_NOT_FOUND, 'MATCH_NOT_FOUND');
  t.strictEqual(index.reactRouterServerErrors.MATCH_INTERNAL_ERROR, 'MATCH_INTERNAL_ERROR');
  t.throws(function reactRouterServerErrorsObjectShouldNotBeModifiable() {
    index.reactRouterServerErrors.MATCH_REDIRECT = '123';
  });

  t.end();
});

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
        stripReactDataAttr($);
        t.strictEqual($.html(), assertions.PROFILE_OUTPUT);
        done(t);
      });
    }
  };
  setup(options);
});

test('rendering a react view with custom script type', function(t) {
  var options = {
    engine: renderer.create({scriptType: 'application/ld+json'}),
    onSetup: function(done) {
      inject('/profile', function(err, data) {
        t.error(err);
        var $ = cheerio.load(data);
        stripReactDataAttr($);
        t.strictEqual($.html(), assertions.PROFILE_OUTPUT_CUSTOM_SCRIPT_TYPE);
        done(t);
      });
    }
  };
  setup(options);
});

test('rendering a react view to static markup', function(t) {
  var options = {
    engine: renderer.create({ staticMarkup: true }),
    onSetup: function(done) {
      inject('/profile', function(err, data) {
        t.error(err);
        var $ = cheerio.load(data);
        t.strictEqual($.html(), assertions.PROFILE_OUTPUT_STATIC_MARKUP);
        done(t);
      });
    }
  };
  setup(options);
});

test('performance collector to be asserted to be a function', function(t) {

  function underTest1() {
    renderer.create({
      performanceCollector: 'SOME_STRING_AND_NOT_FUNCTION'
    });
  }

  function underTest2() {
    renderer.create({
      performanceCollector: console.dir
    });
  }

  t.throws(underTest1);
  t.doesNotThrow(underTest2);
  t.end();
});

test('performance collector', function(t) {

  var recorder = [];

  function collector(stats) {
    recorder.push(stats);
  }

  var options = {
    engine: renderer.create({
      performanceCollector: collector
    }),
    onSetup: function(done) {
      inject('/profile', function(err, data) {
        t.error(err);
        t.strictEqual(typeof data, 'string');
        t.strictEqual(recorder.length, 1);
        t.strictEqual(Object.keys(recorder[0]).length, 4);
        t.strictEqual(recorder[0].name, path.resolve(__dirname, 'fixtures/views', 'profile.jsx'));
        t.strictEqual(typeof recorder[0].startTime, 'number');
        t.strictEqual(typeof recorder[0].endTime, 'number');
        t.strictEqual(typeof recorder[0].duration, 'number');
        t.ok(recorder[0].endTime > recorder[0].startTime);
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
      routes: require(path.join(__dirname + '/fixtures/reactRoutes.jsx'))
    }),
    expressRoutes: function(req, res) {
      res.render(req.url, DATA_MODEL);
    },

    onSetup: function(done) {
      inject('/account', function(err, data) {
        t.error(err);
        var $ = cheerio.load(data);
        stripReactDataAttr($);
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

test('all keys in express render `options` should be be sent to client', function(t) {

  var options = {
    engine: renderer.create({
      routes: require(path.join(__dirname + '/fixtures/reactRoutes.jsx'))
    }),
    expressRoutes: function(req, res) {
      res.locals.someSensitiveData = 1234;
      res.render(req.url, DATA_MODEL);
    },

    onSetup: function(done) {
      inject('/account', function(err, data) {
        t.error(err);
        var $ = cheerio.load(data);
        var matchIndex = $.html().indexOf('someSensitiveData');
        t.notEqual(matchIndex, -1);
        done(t);
      });
    }
  };
  setup(options);
});

test('all keys in express render `renderOptionsKeysToFilter` should be used to filter out renderOptions', function(t) {

  var options = {
    engine: renderer.create({
      routes: require(path.join(__dirname + '/fixtures/reactRoutes.jsx')),
      renderOptionsKeysToFilter: ['someSensitiveData']
    }),
    expressRoutes: function(req, res) {
      res.locals.someSensitiveData = 1234;
      res.render(req.url, DATA_MODEL);
    },

    onSetup: function(done) {
      inject('/account', function(err, data) {
        t.error(err);
        var $ = cheerio.load(data);
        var matchIndex = $.html().indexOf('someSensitiveData');
        t.equal(matchIndex, -1);
        done(t);
      });
    }
  };
  setup(options);
});

test('deep keys in express render `renderOptionsKeysToFilter` should be used to filter out nested renderOptions', function(t) {

  var options = {
    engine: renderer.create({
      routes: require(path.join(__dirname + '/fixtures/reactRoutes.jsx')),
      renderOptionsKeysToFilter: ['someSensitiveData.omitDeepProp']
    }),
    expressRoutes: function(req, res) {
      res.locals.someSensitiveData = { passDeepPropThrough: 1234, omitDeepProp: 5678 };
      res.render(req.url, DATA_MODEL);
    },

    onSetup: function(done) {
      inject('/account', function(err, data) {
        t.error(err);
        var html = cheerio.load(data).html();
        function present(str) {
          t.notEqual(html.indexOf(str), -1, str + ' was not present in render');
        }
        function absent(str) {
          t.equal(html.indexOf(str), -1, str + ' was not removed from render');
        }
        present('someSensitiveData');
        present('passDeepPropThrough');
        absent('omitDeepProp');
        done(t);
      });
    }
  };
  setup(options);
});

test('error that renderer throws when asked to run a unknown route', function(t) {

  var options = {
    engine: renderer.create({
      routes: require(path.join(__dirname + '/fixtures/reactRoutes.jsx'))
    }),
    expressRoutes: function(req, res) {
      res.render(req.url, DATA_MODEL);
    },

    onSetup: function(done) {
      inject('/some_garbage', function(err, data) {
        // TODO: t.strictEqual(err._type, 'MATCH_NOT_FOUND');
        t.ok(typeof err === 'object');
        t.ok(typeof data === 'undefined');
        done(t);
      });
    }
  };
  setup(options);
});

test('error that renderer throws when asked to run a redirect route', function(t) {

  var options = {
    engine: renderer.create({
      routes: require(path.join(__dirname + '/fixtures/reactRoutes.jsx'))
    }),
    expressRoutes: function(req, res) {
      res.render(req.url, DATA_MODEL);
    },

    onSetup: function(done) {
      inject('/gohome', function(err, data) {
        // TODO: t.strictEqual(err._type, 'MATCH_REDIRECT');
        t.ok(typeof err === 'object');
        t.ok(typeof data === 'undefined');
        done(t);
      });
    }
  };
  setup(options);
});
