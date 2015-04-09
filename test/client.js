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

var test = require('tape');
var rewire = require('rewire');
var jsdom = require('jsdom').jsdom;
var assertions = require('./fixtures/assertions');

// boot options
var options = {
  react: require('react'),
  router: require('react-router'),
  viewResolver: function(viewName) {
    return require('./fixtures/views/' + viewName);
  }
};

function prepare(markup) {
  var client = rewire('../lib/client');
  var document = jsdom(markup);
  var window = document.defaultView;

  // inject our mock window and document
  client.__set__('_window', window);
  client.__set__('_document', document);
  window.onerror = function(errorMsg) {
    throw new Error(errorMsg);
  };

  global.document = document;
  global.window = window;
  global.navigator = {
    userAgent: 'tape-tests'
  };

  return client;
}

function after() {
  window.onerror = null;
  global.document = null;
  global.window = null;
  global.navigator = null;
}

test('client side boot for plain react views', function(t) {
  var client = prepare(assertions.PROFILE_OUTPUT_WITH_REACT_ATTRS);
  function _boot() {
    client.boot(options);
  }

  t.doesNotThrow(_boot);
  after(client);
  t.end();
});

test('client side boot throws error for invalid markup', function(t) {
  var client = prepare(assertions.PROFILE_OUTPUT_WITH_REACT_ATTRS);

  // change the markup to simulate error
  client.__get__('_document').documentElement.innerHTML = 'SOME_GARBAGE_HTML';
  function _boot() {
    client.boot(options);
  }

  t.throws(_boot);
  after(client);
  t.end();
});
