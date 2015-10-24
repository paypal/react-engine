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

export default React.createClass({

  displayName: 'account',

  render() {

    return (
      <div id='account'>
        <h1>{this.props.name}</h1>
        <h6>I am a React Router rendered view</h6>
        <ul>
          <li><a href='/some_unknown'>Click to go to an unhandled route</a></li>
          <li><a href='/messages'>Messages</a></li>
          <li><a href='/mymessages'>Redirects to /messages</a></li>
        </ul>
      </div>
    );
  }
});
