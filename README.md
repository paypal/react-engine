# react-engine

[![Build Status](https://travis-ci.org/paypal/react-engine.svg?branch=master)](https://travis-ci.org/paypal/react-engine)

### What is react-engine?
* a react render engine for [Universal](https://medium.com/@mjackson/universal-javascript-4761051b7ae9) (previously [Isomorphic](http://nerds.airbnb.com/isomorphic-javascript-future-web-apps/)) JavaScript apps written with express
* renders both plain react views and react-router views
* enables server rendered views to be client mountable


### Install
```sh
  npm install react-engine --save
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
Pass in an optional JavaScript object as options to the react-engine's [server engine create method](#setup-in-an-express-app).
The options object can contain properties from [react router's create configuration object](http://rackt.github.io/react-router/#Router.create).

Additionally, it can contain the following **optional** properties,

- `docType`: <String> - string that can be used as a doctype (_Default: `<!DOCTYPE html>`_)
- `routesFilePath`: <String> - path for the file that contains the react router routes.
                   react-engine uses this behind the scenes to reload the routes file in
                   cases where [express's app property](http://expressjs.com/api.html#app.set) `view cache` is false, this way you don't need to restart the server every time a change is made in the view files or routes file.
- `renderOptionsKeysToFilter`: <Array> - an array of keys that need to be filtered out from the data object that gets fed into the react component for rendering. [more info](#data-for-component-rendering)
- `performanceCollector`: <Function> - to collects [perf stats](#performance-profiling)

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
// assuming we use `browserify`
var client = require('react-engine').client;

// finally, boot whenever your app is ready
// example:
document.addEventListener('DOMContentLoaded', function onLoad() {

  // `onBoot` - Function (optional)
  // returns data that was used
  // during rendering as the first argument
  // the second argument is the `router` created behind the scenes
  // (only available while using react-router)
  client.boot(/* client options object */, function onBoot(data, router) {

  });
};

// if the data is needed before booting on
// client, call `data` function anytime to get it.
// example:
var data = client.data();
```

###### Client options spec
Pass in a JavaScript object as options to the react-engine's client boot function.
The options object can contain properties from [react router's create configuration object](http://rackt.github.io/react-router/#Router.create).

<<<<<<< HEAD
Additionally, it should contain the following `required` property,

- `mountNode`: <Element Object> override mount point for the client. Default is `document`.
=======
Additionally, it should contain the following **required** property,
>>>>>>> upstream/master

- `viewResolver` : <Function> - a function that react-engine needs to resolve the view file.
  an example of the viewResolver can be [found here](https://github.com/paypal/react-engine/blob/ecd27b30a9028d3f02b8f8e89d355bb5fc909de9/examples/simple/public/index.js#L29).

### Data for component rendering
The actual data that gets fed into the component for rendering is the `renderOptions` object that [express generates](https://github.com/strongloop/express/blob/2f8ac6726fa20ab5b4a05c112c886752868ac8ce/lib/application.js#L535-L588).

If you don't want to pass all that data, you can pass in an array of object keys that react-engine can filter out from the `renderOptions` object before passing it into the component for rendering.

```javascript
  // example of using `renderOptionsKeysToFilter` to filter `renderOptions` keys
  var engine = ReactEngine.server.create({
    renderOptionsKeysToFilter: ['mySensitiveDataThatIsIn_res.locals'],
    routes: require(path.join(__dirname + './reactRoutes'))
  });
```

Note: By default, the following three keys are always filtered out from `renderOptions` no matter whether `renderOptionsKeysToFilter` is configured or not.

- `settings`
- `enrouten`
- `_locals`

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
  reactRoutes: './routes.jsx'
  performanceCollector: collector
});
```

### Notes
* On the client side, the state is exposed on the window object's property `__REACT_ENGINE__`
* When Express's `view cache` app property is false (mostly in non-production environments), views are automatically reloaded before render. So there is no need to restart the server for seeing the changes.
* You can use `js` as the engine if you decide not to write your react views in `jsx`.
* [Blog on react-engine](https://www.paypal-engineering.com/2015/04/27/isomorphic-react-apps-with-react-engine/)

### Migration from 1.x to 2.x
2.x version of react-engine brought in a major api change. Basically it affects the property names of the [object that gets passed in during the engine creation](https://github.com/paypal/react-engine#server-options-spec) on the server side and also how routes definition is passed into react-engine.

In v2.x, `routes` need to be explicitly required and passed in to the engine creation method. Also, any [react-router known properties can be passed in](http://rackt.github.io/react-router/#Router.create).

An example engine creation can be found [here](https://github.com/paypal/react-engine/blob/71ac27196e72059484332a491cd66982797a60a3/examples/complex/index.js#L28).

### License
[Apache Software License v2.0](http://www.apache.org/licenses/LICENSE-2.0)
