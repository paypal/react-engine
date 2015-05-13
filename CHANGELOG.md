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
