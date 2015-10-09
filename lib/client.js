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
var React = require('react');
var Config = require('./config');
var Router = require('react-router');
var ReactDOM = require('react-dom');

var createLocation = require('history/lib/createLocation');

// declaring like this helps in unit test
// dependency injection using `rewire` module
var _window;
var _document;
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  _window = window;
  _document = document;
}

// returns the data/state that was
// injected by server during rendering
exports.data = function data() {
  return {};//_window[Config.client.variableName];
};

// the client side boot function
exports.boot = function boot(options, callback) {

  var viewResolver = options.viewResolver;

  // pick up the state that was injected by server during rendering
  var props = _window[Config.client.variableName];

  var useRouter = (props.__meta.view === null);

  debug('client.js match props %s', JSON.stringify(props));

  if (useRouter) {

    if (!options.routes) {
      throw new Error('asking to use react router for rendering, but no routes are provided');
    }

    // seems pointless to do this.
    options.location = createLocation(options.location) || createLocation(Router.HistoryLocation);

    // create and run the router
    var router = Router.create(options);

    router.run(function onRouterRun(Component) {
      // create a component instance
      var componentInstance = React.createElement(Component, props);

      // finally, render the component instance into the document
      ReactDOM.render(componentInstance, _document);
    });
  } else {
    // get the file from viewResolver supplying it with a view name
    var view = viewResolver(props.__meta.view);

    debug('client.js view %s',view);

    // create a react view factory
    var viewFactory = React.createFactory(view);

    // render the factory on the client
    // doing this, sets up the event
    // listeners and stuff aka mounting views.
    debug('client.js match props %s', JSON.stringify(props));

    ReactDOM.render(viewFactory(props), _document);
  }

  // call the callback with the data that was used for rendering
  return callback && callback(props);
};
