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

var _require;
var glob = require('glob');
var path = require('path');
var format = require('util').format;
var debug = require('debug')(require('../package.json').name);

function clearRequireCache(file) {
  delete require.cache[file];
}

// clears require cache of files that have
// extension `extension` from a given directory `dir`.
function clearRequireCacheInDir(dir, extension) {

  var options = {
    cwd: dir
  };

  // find all files with the `extension` in the express view directory
  // and clean them out of require's cache.
  var files = glob.sync('**/*.' + extension, options);

  files.map(function(file) {
    clearRequireCache(dir + path.sep + (file.split(/\\|\//g).join(path.sep)));
  });
}

// workaround when `npm link`'ed for development
// Force Node to load modules from linking parent.
// https://github.com/npm/npm/issues/5875
// plus React doesn't LIKE (at all) when
// multiple copies of React are used around
// https://github.com/facebook/react/issues/1939
function safeRequire(name) {

  var module;

  try {
    module = require(name);
  }
  catch (err) {
    // lazy load the module
    if (!_require) {
      _require = require('parent-require');
    }

    debug(format('%j', err));
    module = _require(name);
  }

  return module;
}

exports.safeRequire = safeRequire;
exports.clearRequireCache = clearRequireCache;
exports.clearRequireCacheInDir = clearRequireCacheInDir;
