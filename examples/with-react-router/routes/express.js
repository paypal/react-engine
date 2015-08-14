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
import reactRouterRoutes from './react-router';

/*  HELPER -
    -------------------------------------------------------------
    this helper function, takes the react-router's route
    manifest and returns an array of routes (url path strings)
    -------------------------------------------------------------
    copied from: https://github.com/rackt/react-router/issues/953
    -------------------------------------------------------------
*/
function getRoutePathFromReactRouterRoutes(routes, parentPath) {

    let result = [];
    routes = Array.isArray(routes) ? routes : [routes];

    routes.forEach((route) => {
        const props = route._store.props;
        let path = props.path;

        if (path) {
            path = parentPath ? join(parentPath, path) : path;
            result.push(path);
        }

        if (props.children) {
            result = result.concat(getRoutePathFromReactRouterRoutes(props.children, path));
        }
    });

    return result;
}

// export the express router
var router = module.exports = Router();

getRoutePathFromReactRouterRoutes(reactRouterRoutes).map(function(routePath) {
  router.get(routePath, function(req, res) {
    res.render(req.url, {
      title: 'React Engine Express Sample App',
      name: 'Jordan'
    });
  });
});
