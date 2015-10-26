'use strict';

module.exports = function(grunt) {
  require('time-grunt')(grunt);
  require('grunt-config-dir')(grunt, {
    configDir: require('path').resolve('grunt')
  });

  grunt.registerTask('default', ['eslint']);
};
