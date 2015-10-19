'use strict';

module.exports = function eslint(grunt) {
  grunt.loadNpmTasks('grunt-eslint');
  return {
    options: {
      configFile: '.eslint'
    },
    target: [
      '!examples/simple/public/bundle.js',
      '!examples/complex/public/bundle.js',
      'examples/**/*.js',
      'lib/**/*.js',
      'index.js'
    ]
  };
};
