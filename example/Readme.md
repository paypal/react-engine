# react-engine example app
This example illustrates the usage of react-engine to build and run an universal/isomorphic app.

## app composition
* [express - 4.x](https://github.com/strongloop/express) on the server side
* [react-engine - 2.x](https://github.com/paypal/react-engine) as the express view render engine
* [react - 0.13.x](https://github.com/facebook/react) for building the UI
* [react-router - 0.13.x](https://github.com/rackt/react-router) for UI routing
* [webpack - 1.x](https://github.com/webpack/webpack) as the client side module loader
* [babel - 6.x](https://github.com/babel/babel) for compiling the ES6 JS code

## to run the example
```shell
# cd `into_this_dir`
$ npm install
$ npm start
$ open http://localhost:3000
```

## step by step walkthrough to build the app

### step 1
```shell
  # let us start by installing the dependencies for our app
  # create a npm manifest
  # (fill out the needed information like name, author, etc..)
  $ npm init

  # install express, react, react-router & react-engine
  npm install express react-engine@2 react@0.13 react-router@0.13 --save

  # install the rest of the dependencies
  npm install babel-register webpack --save
```

### step 2.1
```shell
  # next, let us build the client side of our app
  # create a directory called public and the client side index file
  $ mkdir public
  $ touch public/index.js

  # create a directory called views to hold all the view files and a client side routes file to hold the react-router routes
  $ mkdir public/views
  $ touch public/routes.jsx
```

### step 2.2
```javascript
  // setup the client side react-engine inside public/index.js
  // Instructions: https://github.com/paypal/react-engine#usage-on-client-side-mounting
  
```



http://bit.ly/1P2aM1H
