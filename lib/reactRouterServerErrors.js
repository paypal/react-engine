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

var errorTypes = ['MATCH_REDIRECT',
                  'MATCH_NOT_FOUND',
                  'MATCH_INTERNAL_ERROR'];

var properties = {};

errorTypes.map(function(errorType) {
  properties[errorType] = {
    configurable: false,
    writable: false,
    enumerable: true,
    value: errorType
  };
});

/*
  export the reactRouterServerErrors object
  {
    MATCH_REDIRECT: 'MATCH_REDIRECT',
    MATCH_NOT_FOUND: 'MATCH_NOT_FOUND',
    MATCH_INTERNAL_ERROR: 'MATCH_INTERNAL_ERROR'
  }
*/
module.exports = Object.create(null, properties);
