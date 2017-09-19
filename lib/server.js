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

var isString = require('lodash/isString');
var assign = require('lodash/assign');
var unset = require('lodash/unset');
var path = require('path');
var util = require('./util');
var assert = require('assert');
var Config = require('./config.json');
var jsesc = require('jsesc');
var ReactDOMServer = require('react-dom/server');
var debug = require('debug')(require('../package').name);
var ReactRouterServerErrors = require('./reactRouterServerErrors');

var format = require('util').format;
var Performance = require('./performance');

// safely require the peer-dependencies
var React = util.safeRequire('react');

function generateReactRouterServerError(type, existingErrorObj, additionalProperties) {
  var err = existingErrorObj || new Error('react router match fn error');
  err._type = type;
  if (additionalProperties) {
    assign(err, additionalProperties);
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

  createOptions.scriptType = isString(createOptions.scriptType) ? createOptions.scriptType : Config.scriptType;
  createOptions.docType = isString(createOptions.docType) ? createOptions.docType : Config.docType;
  createOptions.renderOptionsKeysToFilter = createOptions.renderOptionsKeysToFilter || [];
  createOptions.staticMarkup = createOptions.staticMarkup !== undefined ? createOptions.staticMarkup : Config.staticMarkup;

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
      if (createOptions.staticMarkup) {
        // render the component to static markup
        html += ReactDOMServer.renderToStaticMarkup(component);
      } else {
        // render the redux wrapped component
        if (createOptions.reduxStoreInitiator) {
          // add redux provider
          var Provider = require('react-redux').Provider;
          var initStore;
          try {
            initStore = require(createOptions.reduxStoreInitiator);
            if (initStore.default) {
              initStore = initStore.default;
            }
            var store = initStore(data);
            var wrappedComponent = React.createElement(Provider, { store: store }, component);
            // render the component
            html += ReactDOMServer.renderToString(wrappedComponent);
          } catch (err) {
            return done(err);
          }
        } else {
          // render the component
          html += ReactDOMServer.renderToString(component);
        }

       // the `script` tag that gets injected into the server rendered pages.
       // https://www.owasp.org/index.php/XSS_(Cross_Site_Scripting)_Prevention_Cheat_Sheet#RULE_.233_-_JavaScript_Escape_Before_Inserting_Untrusted_Data_into_JavaScript_Data_Values
       var openScriptTag = `<script id="${Config.client.markupId}" type="${createOptions.scriptType}" ${options.nonce ? `nonce="${options.nonce}"` : ''}>`;
       // Escape data for injecting into <script> tag
       // https://mathiasbynens.be/notes/etago
       var script = openScriptTag + jsesc(data, {
              'escapeEtago': true, // old option for escaping in <script> or <style> context
              'isScriptContext': true, // soon to be new option
              'compact': true, // minifies
              'json': true // ensures JSON compatibility
            })
          + '</script>';


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
    var data = assign({
      __meta: {
        // get just the relative path for view file name
        view: null,
        markupId: Config.client.markupId
      }
    }, options);
    if (this.useRouter && !createOptions.routes) {
      return done(new Error('asking to use react router for rendering, but no routes are provided'));
    }

    // since `unset` mutates the obj, lets clone a copy
    // Also, we are using JSON.parse(JSON.stringify(data)) to clone the object super fast.
    // a valid assumption in using this method of cloning at this point: we have only variables
    // and not any functions in data object - so need for lodash cloneDeep
    try {
      data = JSON.parse(JSON.stringify(data));
      createOptions.renderOptionsKeysToFilter.forEach(function(key) {
        unset(data, key);
      });
    } catch (parseErr) {
      return done(parseErr);
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
            renderProps.createElement = function(Component, routerProps) {
              // Other than fusing the data object with the routerProps, there is no way
              // to pass data into the routing context of react-router during a server render.
              // since we are going to use `assign` to fuse the routerProps and the actual
              // data object, we need to make sure that there are no properties between the two object
              // with the same name at the root level. (Having two properties with the same name breaks assign.)
              // Info on why we need to fuse the two objects?
              // --------------------------------------------
              // * https://github.com/ngduc/react-setup/issues/10
              // * https://github.com/reactjs/react-router/issues/1969
              // * http://stackoverflow.com/questions/36137901/react-route-and-server-side-rendering-how-to-render-components-with-data
              if (options.settings.env !== 'production') {
                var intersection = Object.keys(routerProps).filter(function(elem) {
                  return Object.keys(data).indexOf(elem) !== -1;
                });
                if (intersection.length) {
                  var errMsg = 'Your data object cannot have property(ies) named: "' +
                    intersection +
                    '"\n Blacklisted property names that cannot be used: "' +
                    Object.keys(routerProps) +
                    '"\n'
                  throw new Error(errMsg);
                }
              }

              // define a createElement strategy for react-router that transfers data props to all route "components"
              // for any component created by react-router, fuse data object with the routerProps
              // NOTE: This may be imposing too large of an opinion?
              return React.createElement(Component, assign({}, data, routerProps));
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
