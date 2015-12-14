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
