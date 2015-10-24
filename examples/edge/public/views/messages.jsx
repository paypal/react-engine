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

  displayName: 'messages',

  render() {

    return (
      <div id='messages'>
        <h1>{this.props.name}</h1>
        <ol>
        {
          this.props.messages.map(message => <li key={message.id}>{message.text}</li>)
        }
        </ol>
        <a href='/some_unknown'>Click to go to an unhandled route</a>
        <a href='/messages'>Messages</a>
        <a href='/mymessages'>Redirects to /messages</a>
      </div>
    );
  }
});
