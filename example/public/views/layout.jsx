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

module.exports = React.createClass({

  render: function render() {

    return (
      <html>
        <head>
          <meta charSet='utf-8' />
          <title>React Engine Example App</title>
          <link rel='stylesheet' href='/styles.css'></link>
        </head>
        <body>
          <div>
            {/* Component that renders the active child route handler of a parent route handler component. */}
            <Router.RouteHandler {...this.props} />
          </div>
        </body>
        <script src='/bundle.js'></script>
      </html>
    );
  }
});
