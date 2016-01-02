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

var path = require('path');
var util = require('./util');
var assert = require('assert');
var Config = require('./config');
var format = require('util').format;
var Performance = require('./performance');
var omit = require('lodash-node/compat/object/omit');
var merge = require('lodash-node/compat/object/merge');
var isString = require('lodash-node/compat/lang/isString');

// a template of the `script` tag that gets
// injected into the server rendered pages.
var TEMPLATE = ['<script id="%s" type="application/javascript">var ',
                Config.client.variableName,
                ' = %s;</script>'
              ].join('');

exports.create = function create(createOptions) {

  // safely require the peer-dependencies
  var React = util.safeRequire('react');
  var ReactDOM = util.safeRequire('react-dom/server');
  var Router;

  try {
    Router = require('react-router');
  } catch (err) {
    if (!Router && createOptions.routes) {
      throw err;
    }
  }

  createOptions = createOptions || {};
  createOptions.docType = isString(createOptions.docType) ? createOptions.docType : Config.docType;
  createOptions.renderOptionsKeysToFilter = createOptions.renderOptionsKeysToFilter || [];

  assert(Array.isArray(createOptions.renderOptionsKeysToFilter),
      '`renderOptionsKeysToFilter` - should be an array');

  createOptions.renderOptionsKeysToFilter =
    createOptions.renderOptionsKeysToFilter.concat(Config.defaultKeysToFilter);

  if (createOptions.performanceCollector) {
    assert.equal(typeof createOptions.performanceCollector,
        'function',
        '`performanceCollector` - should be a function');
  }

  // the render implementation
  return function render(thing, options, callback) {

    var perfInstance;

    if (createOptions.performanceCollector) {
      perfInstance = Performance(thing);
    }

    function done(err, html) {
      if (!options.settings['view cache']) {
        // remove all the files under the express's view folder from require cache.
        // Helps in making changes to react views without restarting the server.
        util.clearRequireCache(createOptions.routesFilePath);
        util.clearRequireCacheInDir(options.settings.views, options.settings['view engine']);
      }

      if (createOptions.performanceCollector) {
        createOptions.performanceCollector(perfInstance());
      }

      callback(err, html);
    }

    if (createOptions.routes && createOptions.routesFilePath) {
      // if `routesFilePath` property is provided, then in
      // cases where 'view cache' is false, the routes are reloaded for every render.
      createOptions.routes = require(createOptions.routesFilePath);
    }

    // initialize the markup string
    var html = createOptions.docType;

    // create the data object that will be fed into the React render method.
    // Data is a mash of the express' `render options` and `res.locals`
    // and meta info about `react-engine`
    var data = merge({
      __meta: {
        // get just the relative path for view file name
        view: null,
        markupId: Config.client.markupId
      }
    }, omit(options, createOptions.renderOptionsKeysToFilter));

    if (this.useRouter && !createOptions.routes) {
      return done(new Error('asking to use react router for rendering, but no routes are provided'));
    }

    var componentInstance;

    try {
      if (this.useRouter) {
        // change the `location` property for this render lifecycle
        createOptions.location = thing;
        var router = Router.create(createOptions);

        // runs the react router that gives the Component to render
        router.run(function onRouterRun(Component) {
          componentInstance = React.createElement(Component, data);
        });
      }
      else {
        // path utility to make path string compatible in different OS
        // ------------------------------------------------------------
        // use `path.normalize()` to normalzie absolute view file path and absolute base directory path
        // to prevent path strings like `/folder1/folder2/../../folder3/exampleFile`
        // then, derive relative view file path
        // and replace backslash with slash to be compatible on Windows
        data.__meta.view = path.normalize(thing)
          .replace(path.normalize(options.settings.views), '').substring(1)
          .replace('\\', '/');

        var view = require(thing);

        // create the Component using react's createFactory
        var component = React.createFactory(view);
        componentInstance = component(data);
      }

      // render the componentInstance
      html += ReactDOMServer.renderToString(componentInstance);

      // state (script) injection
      var script = format(TEMPLATE, Config.client.markupId, JSON.stringify(data));

      if (createOptions.docType === '') {
        // if the `docType` is empty, the user did not want to add a docType to the rendered component,
        // which means they might not be rendering a full page with `html` and `body` tags
        // so attach the script tag to just  the end of the generated html string
        html += script;
      }
      else {
        html = html.replace('</body>', script + '</body>');
      }

      return done(null, html);
    }
    catch (err) {

      // on error, pass to the next
      // middleware in the chain!
      return done(err);
    }
  };
};
