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

  mixins: [Router.State],

  render: function render() {
    var movieId = this.getParams().id;
    var movie = this.props.movies.filter(function(_movie) {
      return _movie.id === movieId;
    })[0];

    return (
      <div id='detail'>
        <h1>{movie.title}</h1>
        <img src={movie.image} alt={movie.title} />
        <a href={movie.url} target='_blank'>more info</a>
      </div>
    );
  }
});
