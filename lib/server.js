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

var util = require('./util');
var assert = require('assert');
var Config = require('./config');
var format = require('util').format;
var Performance = require('./performance');
var omit = require('lodash-node/compat/object/omit');
var merge = require('lodash-node/compat/object/merge');

// safely require the peer-dependencies
var React = util.safeRequire('react');
var Router = util.safeRequire('react-router');

// a template of the `script` tag that gets
// injected into the server rendered pages.
var TEMPLATE = ['<script id="%s" type="application/javascript">var ',
                Config.client.variableName,
                ' = %s;</script>'
              ].join('');

exports.create = function create(createOptions) {

  createOptions = createOptions || {};

  if (createOptions.performanceCollector) {
    assert.equal(typeof createOptions.performanceCollector,
        'function',
        '`performanceCollector` - should be a function');
  }

  // the render implementation
  return function render(thing, options, callback) {

    var routes;
    var perfInstance;

    if (createOptions.performanceCollector) {
      perfInstance = Performance(thing);
    }

    function done(err, html) {
      if (options.settings.env === 'development') {
        // remove all the files under the express's view folder from require cache.
        // Helps in making changes to react views without restarting the server.
        util.clearRequireCache(createOptions.reactRoutes);
        util.clearRequireCacheInDir(options.settings.views, options.settings['view engine']);
      }

      if (createOptions.performanceCollector) {
        createOptions.performanceCollector(perfInstance());
      }

      callback(err, html);
    }

    if (createOptions.reactRoutes) {
      routes = require(createOptions.reactRoutes);
    }

    // initialize the markup string
    var html = Config.docType;

    // create the data object that will be fed into the React render method.
    // Data is a mash of the express' `render options` and `res.locals`
    // and meta info about `react-engine`
    var data = merge({
      __meta: {
        // get just the relative path for view file name
        view: null,
        markupId: Config.client.markupId
      }
    }, omit(options, ['settings', 'enrouten', '_locals']));

    if (this.useRouter && !routes) {
      return done(new Error('asking to use react router for rendering, but no routes are provided'));
    }

    var componentInstance;

    try {
      if (this.useRouter) {
        // runs the react router that gives the Component to render
        Router.run(routes, thing, function onRouterRun(Component) {
          componentInstance = React.createElement(Component, data);
        });
      }
      else {
        data.__meta.view = thing.replace(options.settings.views, '').substring(1);

        var view = require(thing);

        // create the Component using react's createFactory
        var component = React.createFactory(view);
        componentInstance = component(data);
      }

      // render the componentInstance
      html += React.renderToString(componentInstance);

      // state (script) injection
      var script = format(TEMPLATE, Config.client.markupId, JSON.stringify(data));
      html = html.replace('</body>', script + '</body>');

      return done(null, html);
    }
    catch (err) {

      // on error, pass to the next
      // middleware in the chain!
      return done(err);
    }
  };
};
