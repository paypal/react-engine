## 4.4.0
* Add support to React 16
* Update peerDependencies to remove installation warnings
* Update devDependencies to execute test in React 16

## 4.3.0 (Feb 7 2017)
* Add option to change injected script type from the default 'application/json'.

## 4.2.1 (Dec 9 2016)
* Converted from escape-html to jsesc  (https://github.com/paypal/react-engine/pull/185)

## 4.2.0 (Oct 24 2016)
* XSS safe implementation of prop passing from server to client (https://github.com/paypal/react-engine/pull/179/)
* Specify `react` and `react-dom` as peer dependencies (https://github.com/paypal/react-engine/pull/177)
* replace full lodash inlined into client with lodash/assign (https://github.com/paypal/react-engine/pull/176)
* support dot-lookup paths in renderOptionsKeysToFilter (https://github.com/paypal/react-engine/pull/175)

## 4.1.0 (Aug 11 2016)
* safeguard against property over look while fusing together data object and routerProps object in the server render (https://github.com/paypal/react-engine/pull/173/)

## 4.0.0 (July 1 2016)
* removed `react-dom` from being a `react-engine` dependency
* updated a lot of dependencies and fixed tests
* remove JSCS/grunt and added airbnb eslint config

## 3.4.1 (May 16 2016)
* add backward compatibility for react-router@1 (https://github.com/paypal/react-engine/pull/159)

## 3.4.0 (May 13 2016)
* Update deprecated `history` and `RoutingContext` for react-router (https://github.com/paypal/react-engine/pull/155)

## 3.3.0 (Apr 30 2016)
* Added scriptLocation server option to allow consumers to specify location of REACT_ENGINE script (https://github.com/paypal/react-engine/pull/153)
* Support ES6 module syntax for routes (https://github.com/paypal/react-engine/pull/154)

## 3.2.2 (Apr 19 2016)

* fix #151, make react-router optional (https://github.com/paypal/react-engine/pull/152)

## 3.2.1 (Apr 12 2016)

* Support ES6 module syntax for React views (https://github.com/paypal/react-engine/pull/149)

## 3.2.0 (Mar 27 2016)

* Allow consumers to override history object  (https://github.com/paypal/react-engine/issues/126)

## 3.1.0 (Jan 25 2016)

* fix - set implicit extension to import file names
* fix - Allow consumers to override history object
* Use path instead of pathname to ensure querystring is not stripped - https://github.com/paypal/react-engine/pull/131
* Client-side error when using code splitting in webpack - https://github.com/paypal/react-engine/pull/129

## 3.0.0 (Jan 10 2016)

* [v3.x] - support react-router@1 and react@0.14

## 2.6.2 (Jan 3 2016)

* fix - lodash-node package is deprecated(https://github.com/paypal/react-engine/issues/122)

## 2.6.1 (Dec 30 2015)

* fix undefined createOptions var [client.js] (https://github.com/paypal/react-engine/issues/119)

## 2.6.0 (Nov 06 2015)

* make the render root configurable (https://github.com/paypal/react-engine/issues/68)

## 2.5.0 (Oct 29 2015)

* Throw an error only if peer dependency is not installed and is really required (https://github.com/paypal/react-engine/pull/98)

## 2.4.0 (Oct 15 2015)

* Export Router object to consumers. (https://github.com/paypal/react-engine/issues/81)

## 2.3.0 (Oct 11 2015)

* Allow custom doctype option. (https://github.com/paypal/react-engine/pull/96)

## 2.2.1 (Oct 09 2015)

* make the clearRequireCacheInDir platform windows friendly (https://github.com/paypal/react-engine/issues/93)

## 2.2.0 (Sep 02 2015)

* Allow finer grain control of render properties (https://github.com/paypal/react-engine/issues/73)

## 2.1.0 (Aug 20 2015)

* resolve cache clear logic based on the 'view cache' (https://github.com/paypal/react-engine/issues/74)
* updated readme with migration to v2.x notes (https://github.com/paypal/react-engine/issues/75)
* updated readme references of Isomorphic JavaScript to Universal JavaScript (https://github.com/paypal/react-engine/issues/60)

## 2.0.0 (Aug 1 2015)

* Major API changes (specifically the options object property name changes)
* React-Router config properties can be passed through the react engine now.

## 1.7.0 (June 22, 2015)

* Windows path fix (https://github.com/paypal/react-engine/pull/41)

## 1.6.0 (May 13, 2015)

* expose state/data on the client side using additional function called data. Helps in flux implementations, which need data even before booting.

## 1.5.0 (May 9, 2015)

* made peerDependencies and dependencies, `react` and `react-router`'s versions to be more flexible.

## 1.4.1 (May 7, 2015)

* Fix: https://github.com/paypal/react-engine/issues/28
* add unit tests for expressView.js
* change tape test reporter from `tap-spec` to `faucet`

## 1.4.0 (May 3, 2015)

* remove passing react & react-router as options in the client boot.
* lock down version of `jsdom` (latest versions seem to fail tests in Node.js env)

## 1.3.0 (April 30, 2015)

* added performance profiling

## 1.2.0 (April 25, 2015)

* generate semantic html by injecting script tag before end of html tag
* https://github.com/paypal/react-engine/pull/16

## 1.1.0 (April 11, 2015)

* added an API to the client side code to expose data.
* added ChangeLog and .npmignore
* added tap-spec to pretty format tape test results
* added .editorconfig file

## 1.0.0 (April 9, 2015)

* initial release
