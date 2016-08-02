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

var Config = require('./config.json');
var ReactDOM = require('react-dom');
var assign = require('lodash').assign;
var isFunction = require('lodash').isFunction;

// declaring like this helps in unit test
// dependency injection using `rewire` module
var _window;
var _document;
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  _window = window;
  _document = document;
}

var _unescapeScript = function(data) {
  try {
    var target = JSON.stringify(data);
    return JSON.parse(target.replace(/<\/_escaped_script/gm, '</script'));
  } catch (err) {
    console.log(err);
    return {};
  }
}

// returns the data/state that was
// injected by server during rendering
exports.data = function data() {
  return _unescapeScript(_window[Config.client.variableName]);
};

// the client side boot function
exports.boot = function boot(options, callback) {

  var React = require('react');
  var Router;
  var RouterComponent;
  var match;
  var browserHistory;

  try {
    Router = require('react-router');
    RouterComponent = Router.Router;
    match = Router.match;

    // compatibility for both `react-router` v2 and v1
    browserHistory = Router.browserHistory || require('history').createHistory();
  } catch (err) {
    if (!Router && options.routes) {
      throw err;
    }
  }

  var router;
  var history;
  var location;
  var viewResolver = options.viewResolver;

  // pick up the state that was injected by server during rendering
  var props = _window[Config.client.variableName];
  var useRouter = (props.__meta.view === null);
  var mountNode = options.mountNode || _document;

  // wrap component with react-redux Proivder if redux is required
  var wrap = function(component) {
    if (options.redux && options.redux.initStore && isFunction(options.redux.initStore)) {
      var Provider = require('react-redux').Provider;
      var store = options.redux.initStore(props);
      return React.createElement(Provider, { store: store }, component);
    } else {
      return component;
    }
  };

  if (useRouter) {

    if (!options.routes) {
      throw new Error('asking to use react router for rendering, but no routes are provided');
    }

    history = options.history || browserHistory;
    location = _window.location.pathname +
      _window.location.search + _window.location.hash;

    // Wrap the 'render' function within a call to 'match'. This is a workaround to support
    // users using code splitting functionality
    match({ routes: options.routes, location: location }, function() {

      // for any component created by react-router, merge model data with the routerProps
      // NOTE: This may be imposing too large of an opinion?
      var routerComponent = React.createElement(RouterComponent, {
        createElement: function(Component, routerProps) {
          return React.createElement(Component, assign({}, props, routerProps));
        },

        routes: options.routes,
        history: history
      });

      // wrap routerComponent with redux provider
      ReactDOM.render(wrap(routerComponent), mountNode);
    });

  } else {
    // get the file from viewResolver supplying it with a view name
    var view = viewResolver(props.__meta.view);

    // create a react view factory
    var viewFactory = React.createFactory(view);

    // render the factory on the client
    // doing this, sets up the event
    // listeners and stuff aka mounting views.
    ReactDOM.render(wrap(viewFactory(props)), mountNode);
  }

  // call the callback with the data that was used for rendering
  return callback && callback(props, history);
};
