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

import React from 'react';
import { Route, IndexRoute, Redirect } from 'react-router';
import Layout from './views/layout.jsx';
import Account from './views/account.jsx';
import Messages from './views/messages.jsx';

var routes = module.exports = (
  <Route path='/' component={Layout}>
    <IndexRoute component={Account} />
    <Route path='messages' component={Messages} />
    <Redirect from='home' to='/' />
    <Redirect from='mymessages' to='/messages' />
  </Route>
);