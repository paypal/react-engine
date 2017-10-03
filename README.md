# react-engine

[![Build Status](https://travis-ci.org/paypal/react-engine.svg?branch=master)](https://travis-ci.org/paypal/react-engine)

### What is react-engine?
* a react render engine for [Universal](https://medium.com/@mjackson/universal-javascript-4761051b7ae9) (previously [Isomorphic](http://nerds.airbnb.com/isomorphic-javascript-future-web-apps/)) JavaScript apps written with express
* renders both plain react views and **optionally** react-router views
* enables server rendered views to be client mountable


### Install
```sh
# In your express app, react-engine needs to be installed alongside react/react-dom (react-router is optional)
$ npm install react-engine react react-dom react-router --save
```

### Usage On Server Side
###### Setup in an Express app
```javascript
var Express = require('express');
var ReactEngine = require('react-engine');

var app = Express();

// create an engine instance
var engine = ReactEngine.server.create({
  /*
    see the complete server options spec here:
    https://github.com/paypal/react-engine#server-options-spec
  */
});

// set the engine
app.engine('.jsx', engine);

// set the view directory
app.set('views', __dirname + '/views');

// set jsx or js as the view engine
// (without this you would need to supply the extension to res.render())
// ex: res.render('index.jsx') instead of just res.render('index').
app.set('view engine', 'jsx');

// finally, set the custom view
app.set('view', require('react-engine/lib/expressView'));
```

###### Setup in a [KrakenJS](http://krakenjs.com) app's config.json
```json
{
  "express": {
    "view engine": "jsx",
    "view": "require:react-engine/lib/expressView",
  },
  "view engines": {
    "jsx": {
      "module": "react-engine/lib/server",
      "renderer": {
        "method": "create",
        "arguments": [{
          /*
            see the complete server options spec here:
            https://github.com/paypal/react-engine#server-options-spec
          */
        }]
      }
    }
  }
}
```

###### Server options spec
Pass in a JavaScript object as options to the react-engine's [server engine create method](#setup-in-an-express-app).
The options object should contain the mandatory `routes` property with the route definition.

Additionally, it can contain the following **optional** properties,

- `docType`: \<String> - a string that can be used as a doctype (_Default: `<!DOCTYPE html>`_).
                        (docType might not make sense if you are rendering partials/sub page components, in that case you can pass an empty string as docType)
- `routesFilePath`: \<String> - path for the file that contains the react router routes.
                   react-engine uses this behind the scenes to reload the routes file in
                   cases where [express's app property](http://expressjs.com/api.html#app.set) `view cache` is false, this way you don't need to restart the server every time a change is made in the view files or routes file.
- `renderOptionsKeysToFilter`: \<Array> - an array of keys that need to be filtered out from the data object that gets fed into the react component for rendering. [more info](#data-for-component-rendering)
- `performanceCollector`: \<Function> - to collects [perf stats](#performance-profiling)
- `scriptLocation`: \<String> - where in the HTML you want the client data (i.e. `<script>var __REACT_ENGINE__ = ... </script>`) to be appended (_Default: `body`_).
                    If the value is undefined or set to `body` the script is placed before the `</body>` tag.
                    The only other value is `head` which appends the script before the `</head>` tag.

- `staticMarkup`: \<Boolean> - a boolean that indicates if render components without React data attributes and client data. (_Default: `false`_). This is useful if you want to render simple static page, as stripping away the extra React attributes and client data can save lots of bytes.
- `scriptType`: \<String> - a string that can be used as the type for the script (if it is included, which is only if staticMarkup is false). (_Default: `application/json`_).

###### Rendering views on server side
```js
var data = {}; // your data model

// for a simple react view rendering
res.render(viewName, data);

// for react-router rendering
// pass in the `url` and react-engine
// will run the react-router behind the scenes.
res.render(req.url, data);
```

### Usage On Client Side (Mounting)
```js
// assuming we use a module bundler like `webpack` or `browserify`
var client = require('react-engine/lib/client');

// finally, boot whenever your app is ready
// example:
document.addEventListener('DOMContentLoaded', function onLoad() {

  // `onBoot` - Function (optional)
  // returns data that was used
  // during rendering as the first argument
  // the second argument is the `history` object that was created behind the scenes
  // (only available while using react-router)
  client.boot(/* client options object */, function onBoot(data, history) {

  });
};

// if the data is needed before booting on
// client, call `data` function anytime to get it.
// example:
var data = client.data();
```

###### Client options spec
Pass in a JavaScript object as options to the react-engine's client boot function.
It can contain the following properties,

- `routes` : **required** - _Object_ - the route definition file.
- `viewResolver` : **required** - _Function_ - a function that react-engine needs to resolve the view file.
  an example of the viewResolver can be [found here](https://github.com/paypal/react-engine/blob/ecd27b30a9028d3f02b8f8e89d355bb5fc909de9/examples/simple/public/index.js#L29).
- `mountNode` : **optional** - _HTMLDOMNode_ - supply a HTML DOM Node to mount the server rendered component in the case of partial/non-full page rendering.
- `history` : **optional** - _Object_ - supply any custom history object to be used by the react-router.

### Data for component rendering
The actual data that gets fed into the component for rendering is the `renderOptions` object that [express generates](https://github.com/strongloop/express/blob/2f8ac6726fa20ab5b4a05c112c886752868ac8ce/lib/application.js#L535-L588).

If you don't want to pass all that data, you can pass in an array of object keys or dot-lookup paths that react-engine can filter out from the `renderOptions` object before passing it into the component for rendering.

```javascript
// example of using `renderOptionsKeysToFilter` to filter `renderOptions` keys
var engine = ReactEngine.server.create({
  renderOptionsKeysToFilter: [
    'mySensitiveData',
    'somearrayAtIndex[3].deeply.nested'
  ],
  routes: require(path.join(__dirname + './reactRoutes'))
});
```

Notes:
 - The strings `renderOptionsKeysToFilter` will be used with [lodash.unset](https://lodash.com/docs/#unset), so they can be either plain object keys for first-level properties of `renderOptions`, or dot-separated "lookup paths" as shown in the `lodash.unset` documentation. Use these lookup paths to filter out nested sub-properties.
 - By default, the following three keys are always filtered out from `renderOptions` no matter whether `renderOptionsKeysToFilter` is configured or not.
    - `settings`
    - `enrouten`
    - `_locals`

### Handling redirects and route not found errors on the server side
While using react-router, it matches the url to a component based on the app's defined routes. react-engine captures the redirects and not-found cases that are encountered while trying to run the react-router's [match function on the server side](https://github.com/reactjs/react-router/blob/master/docs/guides/ServerRendering.md).

To handle the above during the lifecycle of a request, add an error type check in your express error middleware. The following are the three types of error that get thrown by react-engine:

Error Type           | Description   
-------------------- | --------------------------------------------------------
MATCH_REDIRECT**     | indicates that the url  matched to a redirection
MATCH_NOT_FOUND      |  indicates that the url  did not match to any component     
MATCH_INTERNAL_ERROR | indicates that react-router encountered an internal error

 _**  for MATCH_REDIRECT error, `redirectLocation` property of the err has the new redirection location_

```javascript
// example express error middleware
app.use(function(err, req, res, next) {
  console.error(err);

  // http://expressjs.com/en/guide/error-handling.html
  if (res.headersSent) {
    return next(err);
  }

  if (err._type && err._type === ReactEngine.reactRouterServerErrors.MATCH_REDIRECT) {
    return res.redirect(302, err.redirectLocation);
  }
  else if (err._type && err._type === ReactEngine.reactRouterServerErrors.MATCH_NOT_FOUND) {
    return res.status(404).send('Route Not Found!');
  }
  else {
    // for ReactEngine.reactRouterServerErrors.MATCH_INTERNAL_ERROR or
    // any other error we just send the error message back
    return res.status(500).send(err.message);
  }
});
```

### Yeoman Generator
There is a Yeoman generator available to create a new express or KrakenJS application which uses react-engine:
[generator-react-engine](https://www.npmjs.com/package/generator-react-engine).

### Performance Profiling

Pass in a function to the `performanceCollector` property to collect the `stats`
object for every render.

##### `stats`
The object that contains the stats info for each render by react-engine.
It has the below properties.
- `name` - Name of the template or the url in case of react router rendering.
- `startTime` - The start time of render.
- `endTime` - The completion time of render.
- `duration` - The duration taken to render (in milliseconds).

```js
// example
function collector(stats) {
  console.log(stats);
}

var engine = require('react-engine').server.create({
  routes: './routes.jsx'
  performanceCollector: collector
});
```

### Notes
* On the client side, the state is exposed in a script tag whose id is `react-engine-props`  
* When Express's `view cache` app property is false (mostly in non-production environments), views are automatically reloaded before render. So there is no need to restart the server for seeing the changes.
* You can use `js` as the engine if you decide not to write your react views in `jsx`.
* [Blog on react-engine](https://www.paypal-engineering.com/2015/04/27/isomorphic-react-apps-with-react-engine/)
* You can add [nonce](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src#Unsafe_inline_script) in `_locals`, which will be added in `script` tag that gets injected into the server rendered pages, like `res.locals.nonce = 'nonce value'` 


### License
[Apache Software License v2.0](http://www.apache.org/licenses/LICENSE-2.0)
