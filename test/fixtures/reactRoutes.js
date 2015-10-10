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

var React = require('react');
var Router = require('react-router');

var App = require('./views/app');
var Account = require('./views/account');

var Route = Router.Route;
var Redirect = Router.Redirect;

module.exports = React.createElement(
  Router,
  null,
  React.createElement(
    Route,
    { path: '/', component: App },
    React.createElement(Route, { path: 'account', component: Account }),
    React.createElement(Redirect, { from: 'redirect-account', to: 'account' }),
    React.createElement(Route, { path: '*', component: Account })
  )
);

// In JSX
// <Router>
//   <Route path='/' component={App}>
//     <Route path='account' component={Account}/>
//     <Redirect from='redirect-account' to='account' />
//     <Route path='*' component={Account}/>
//   </Route>
// </Router>
