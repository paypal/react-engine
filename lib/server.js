/*-------------------------------------------------------------------------------------------------------------------*\
|  Copyright (C) 2016 PayPal                                                                                          |
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
var Config = require('./config.json');
var ReactDOMServer = require('react-dom/server');
var debug = require('debug')(require('../package').name);
var ReactRouterServerErrors = require('./reactRouterServerErrors');

var format = require('util').format;
var Performance = require('./performance');
var omit = require('lodash/object/omit');
var merge = require('lodash/object/merge');
var isString = require('lodash/lang/isString');

// safely require the peer-dependencies
var React = util.safeRequire('react');

// a template of the `script` tag that gets
// injected into the server rendered pages.
var TEMPLATE = ['<script id="%s" type="application/javascript">var ',
                Config.client.variableName,
                ' = %s;</script>'
              ].join('');

function generateReactRouterServerError(type, existingErrorObj, additionalProperties) {
  var err = existingErrorObj || new Error('react router match fn error');
  err._type = type;
  if (additionalProperties) {
    merge(err, additionalProperties);
  }

  return err;
}

exports.create = function create(createOptions) {
  createOptions = createOptions || {};

  // safely require the peer-dependencies
  var React = util.safeRequire('react');
  var Router;
  var match;
  var RouterContext;

  try {
    Router = require('react-router');
    match = Router.match;

    // compatibility for both `react-router` v2 and v1
    RouterContext = Router.RouterContext || Router.RoutingContext;
  } catch (err) {
    if (!Router && createOptions.routes) {
      throw err;
    }
  }

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

    function renderAndDecorate(component, data, html) {
      // render the component
      html += ReactDOMServer.renderToString(component);

      // state (script) injection
      var safeData = util.safeSciptTag(JSON.stringify(data));
      var script = format(TEMPLATE, Config.client.markupId, safeData);
      if (createOptions.docType === '') {
        // if the `docType` is empty, the user did not want to add a docType to the rendered component,
        // which means they might not be rendering a full page with `html` and `body` tags
        // so attach the script tag to just  the end of the generated html string
        html += script;
      }
      else {
        var htmlTag = createOptions.scriptLocation === 'head' ? '</head>' : '</body>';
        html = html.replace(htmlTag, script + htmlTag);
      }

      return html;
    }

    if (createOptions.routes && createOptions.routesFilePath) {
      // if `routesFilePath` property is provided, then in
      // cases where 'view cache' is false, the routes are reloaded for every render.
      createOptions.routes = require(createOptions.routesFilePath);
      if (createOptions.routes.default) {
        createOptions.routes = createOptions.routes.default;
      }
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
        return match({ routes:createOptions.routes, location:thing}, function reactRouterMatchHandler(error, redirectLocation, renderProps) {
          if (error) {
            debug('server.js match 500 %s', error.message);
            var err = generateReactRouterServerError(ReactRouterServerErrors.MATCH_INTERNAL_ERROR, error);
            return done(err);
          } else if (redirectLocation) {
            debug('server.js match 302 %s', redirectLocation.pathname + redirectLocation.search);
            var err = generateReactRouterServerError(ReactRouterServerErrors.MATCH_REDIRECT, null, {
              redirectLocation: redirectLocation.pathname + redirectLocation.search
            });
            return done(err);
          } else if (renderProps) {
            // define a createElement strategy for react-router that transfers data props to all route "components"
            renderProps.createElement = function(Component, routerProps) {
              // for any component created by react-router, merge model data with the routerProps
              // NOTE: This may be imposing too large of an opinion?
              return React.createElement(Component, merge({}, data, routerProps));
            };

            return done(null, renderAndDecorate(React.createElement(RouterContext, renderProps), data, html));
          } else {
            debug('server.js match 404');
            var err = generateReactRouterServerError(ReactRouterServerErrors.MATCH_NOT_FOUND);
            return done(err);
          }
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

        // Check for an ES6 `default` property on the module export
        // ------------------------------------------------------------
        // TypeScript and Babel users that leverage ES6 module depend on this
        // e.g. `export default function MyView() {};`
        if (view.default) {
          view = view.default;
        }

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
