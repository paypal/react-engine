'use strict';

var React = require('react');

module.exports = React.createClass({

  render: function render() {

    return React.createElement(
      'html',
      null,
      React.createElement(
        'head',
        null,
        React.createElement('meta', {
          charSet: 'utf-8'
        })
      ),
      React.createElement(
        'body',
        null,
        React.createElement(
          'h1',
          null,
          'Custom 404 Page Not Found - Sorry',
          this.props.name
        )
      )
    );
  }
});
