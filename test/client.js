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
var rewire = require('rewire');
var jsdom = require('jsdom').jsdom;
var DATA_MODEL = require('./server').DATA_MODEL;
var DATA_MODEL_PROPS = Object.keys(DATA_MODEL);
var assertions = require('./fixtures/assertions.json');

// boot options
var options = {
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

function after(client) {
  window.onerror = null;
  global.document = null;
  global.window = null;
  global.navigator = null;
  client = null;
}

test('client side boot for plain react views', function(t) {
  var client = prepare(assertions.PROFILE_OUTPUT_WITH_REACT_ATTRS);

  function _boot() {

    client.boot(options, function(data) {
      // test that all properties in the DATA_MODEL exist in the received `data`
      // NOTE: we care only about the DATA_MODEL props and not other stuff that
      // might come from things like express `res.locals`
      // https://github.com/paypal/react-engine/blob/19cdca270c5b068f62c6436c9069e578eff7f280/lib/server.js#L65
      DATA_MODEL_PROPS.map(function(key) {
        t.notEqual(typeof data[key], 'undefined');
        t.equal(data[key], DATA_MODEL[key]);
      });

      after(client);
      t.end();
    });
  }

  t.doesNotThrow(_boot);
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
