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

var util = require('./util');
var format = require('util').format;
var inherit = require('util').inherits;
var debug = require('debug')(require('../package').name);
var url = require('url');

var View = util.safeRequire('express/lib/view');

function ReactEngineView(name, options) {
  debug(format('ReactEngineView :constructor: name: %s and options: %j',
                  name, options));

  // when the view name starts with `/` we assume
  // that we need to use react router to render.
  this.useRouter = (name[0] === '/');

  if (this.useRouter) {
    name = url.parse(name).path;
  }

  View.call(this, name, options);
}

// inherit form express view
inherit(ReactEngineView, View);

ReactEngineView.prototype.lookup = function lookup(name) {
  debug(format('ReactEngineView :lookup: name: %s', name));
  if (this.useRouter) {
    return name;
  } else {
    return View.prototype.lookup.call(this, name);
  }
};

ReactEngineView.prototype.render = function render(options, fn) {
  debug(format('ReactEngineView :render:'));
  if (this.useRouter) {
    this.engine(this.name, options, fn);
  } else {
    return View.prototype.render.call(this, options, fn);
  }
};

module.exports = ReactEngineView;
