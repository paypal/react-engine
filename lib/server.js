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
var debug = require('debug')(require('../package').name);
var path = require('path');
var util = require('./util');
var assert = require('assert');
var Config = require('./config');
var ReactDOMServer = require('react-dom/server');

var format = require('util').format;
var Performance = require('./performance');
var omit = require('lodash-node/compat/object/omit');
var merge = require('lodash-node/compat/object/merge');
var isString = require('lodash-node/compat/lang/isString');

// safely require the peer-dependencies
var React = util.safeRequire('react');
var Router = util.safeRequire('react-router');

var match = Router.match;
var RoutingContext = Router.RoutingContext;

// a template of the `script` tag that gets
// injected into the server rendered pages.
var TEMPLATE = ['<script id="%s" type="application/javascript">var ',
                Config.client.variableName,
                ' = %s;</script>'
              ].join('');
var TEMPLATE_REDIRECT = '<html><head><meta http-equiv="refresh" content="0;URL=\'%s\'" /></head></html>';

var Default404 = require('./views/Page404');

exports.create = function create(createOptions) {

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
        util.clearRequireCache(createOptions.page404);
        util.clearRequireCacheInDir(options.settings.views, options.settings['view engine']);
      }

      if (createOptions.performanceCollector) {
        createOptions.performanceCollector(perfInstance());
      }

      callback(err, html);
    }

    function renderAndDecorate(component, data, html) {
      // render the component
      html += ReactDOMServer.renderToString(component);

      // state (script) injection
      var script = format(TEMPLATE, Config.client.markupId, JSON.stringify(data));
      html = html.replace('</body>', script + '</body>');

      return html;
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

    try {
      if (this.useRouter) {

        return match({ routes:createOptions.routes, location:thing},
          function(error, redirectLocation, renderProps) {
          if (redirectLocation) {
            debug('server.js match 302 %s', redirectLocation);

            // perform a client-side redirect, see https://github.com/rackt/history/blob/master/docs/Location.md
            return done(null, format(TEMPLATE_REDIRECT, redirectLocation.pathname + redirectLocation.search));

            //res.redirect(302, redirectLocation.pathname + redirectLocation.search);
          } else if (error) {
            debug('server.js match 500 %s', error);

            //res.send(500, error.message);
          } else if (renderProps) {

            // define a createElement strategy for react-router that transfers data props to all route "components"
            renderProps.createElement = function(Component, routerProps) {
              // for any component created by react-router, merge model data with the routerProps
              // NOTE: This may be imposing too large of an opinion?
              return React.createElement(Component, merge({}, data, routerProps));
            };

            return done(null, renderAndDecorate(React.createElement(RoutingContext, renderProps), data, html));

            //res.send(404, 'Not found');
          } else {
            debug('server.js match 404 %s', renderProps);

            var component = React.createFactory(createOptions.page404 || Default404);

            var mergedData = merge({}, data, {url:thing});

            return done(null, renderAndDecorate(component(mergedData), mergedData, html));
          }
        });
      } else {
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
        return done(null, renderAndDecorate(component(data), data, html));
      }
    }
    catch (err) {

      // on error, pass to the next
      // middleware in the chain!
      return done(err);
    }
  };
};
