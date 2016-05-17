/*-------------------------------------------------------------------------------------------------------------------*\
|  Copyright (C) 2016 PayPal                                                                                          |
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

module.exports = React.createClass({
  displayName: 'Detail',

  render: function render() {
    var movieId = this.props.params.id;
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
