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

var test = require('tape');
var sinon = require('sinon');
var rewire = require('rewire');

var ExpressView = rewire('../lib/expressView');

var View = sinon.spy(require('express/lib/view'));
ExpressView.__set__('View', View);

// View.restore(); //todo

var options = {
  root: __dirname,
  engines: {
    '.jsx': function() {}
  },
  defaultEngine: 'jsx'
};

test('ExpressView is a constructor function with the appropriate properties', function(t) {

  var expressView = new ExpressView('index', options);

  t.assert(View.called);
  t.assert(View.calledWithExactly('index', options));
  t.equal(typeof ExpressView, 'function');
  t.equal(typeof expressView, 'object');
  t.equal(Object.keys(ExpressView.prototype).length, 2);
  t.equal(typeof ExpressView.prototype.lookup, 'function');
  t.equal(typeof ExpressView.prototype.render, 'function');

  t.end();
});

test('ExpressView `useRouter` property resolution', function(t) {

  var expressViewForPlainReactViewRender = new ExpressView('index', options);
  var expressViewForPlainReactRouterViewRender = new ExpressView('/index', options);

  t.equal(expressViewForPlainReactViewRender.useRouter, false);
  t.equal(expressViewForPlainReactRouterViewRender.useRouter, true);

  t.end();
});

test('lookup fn should return name for react-router view render initialization', function(t) {

  var expressView = new ExpressView('/index', options);
  t.equal(expressView.lookup('SOME_STRING'), 'SOME_STRING');

  t.end();
});

test('lookup fn should call original `lookup` function on View`s prototype for plain react views', function(t) {

  var expressView = new ExpressView('index', options);

  var spy = sinon.spy(View.prototype, 'lookup');
  expressView.lookup('SOME_STRING');
  t.equal(spy.lastCall.args[0], 'SOME_STRING');

  View.prototype.lookup.restore();
  t.end();
});

test('render fn should call our registered engine for react-router views', function(t) {

  var expressView = new ExpressView('/index', options);
  var spy = sinon.spy(expressView, 'engine');

  var renderOptions = {};
  var renderFn = function() {};

  expressView.render(renderOptions, renderFn);

  t.equal(spy.lastCall.args[0], '/index');
  t.equal(spy.lastCall.args[1], renderOptions);
  t.equal(spy.lastCall.args[2], renderFn);

  expressView.engine.restore();
  t.end();
});

test('render fn should call original `render` function on View`s prototype for plain react views', function(t) {

  var expressView = new ExpressView('index', options);
  var renderOptions = {};
  var renderFn = function() {};

  var spy = sinon.spy(View.prototype, 'render');
  expressView.render(renderOptions, renderFn);

  t.equal(spy.lastCall.args[0], renderOptions);
  t.equal(spy.lastCall.args[1], renderFn);

  View.prototype.render.restore();
  t.end();
});
