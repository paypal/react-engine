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

import {join} from 'path';
import {Router} from 'express';
import {loadPhotos} from '../lib/photos';
import reactRouterRoutes from './react-router';
import {getRoutePathFromReactRouterRoutes} from '../lib/helper';

// export the express router
var router = module.exports = Router();

function handler(req, res, next) {
  loadPhotos(function(err, data) {

    if (err) {
      return next(err);
    }

    console.dir(data);

    res.render(req.url, {
      title: 'React Engine Express Sample App',
      name: 'Jordan'
    });

  });
}

getRoutePathFromReactRouterRoutes(reactRouterRoutes).map(function(routePath) {
  router.get(routePath, handler);
});
