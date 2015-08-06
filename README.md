# react-engine

[![Build Status](https://travis-ci.org/paypal/react-engine.svg?branch=master)](https://travis-ci.org/paypal/react-engine)

### What is react-engine?
* a composite render engine for express apps to render both plain react views and react-router views on server
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

Additionally, it can contain the following optional properties,

- `performanceCollector`: <function> - to collects [perf stats](#performance-profiling)
- `routesFilePath`: <string> - path for the file that contains the react router routes.
                   react-engine used this behind the scenes to reload the routes file in
                   development mode, this way you don't need to restart the server every time a change is made in the view files or routes file.

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
  client.boot(/* client options object */, function onBoot(data) {

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

Additionally, it should contain the following `required` property,

- `mountNode`: <Element Object> override mount point for the client. Default is `document`.

- `viewResolver` : <function> - a function that react-engine needs to resolve the view file.
  an example of the viewResolver can be [found here](https://github.com/paypal/react-engine/blob/ecd27b30a9028d3f02b8f8e89d355bb5fc909de9/examples/simple/public/index.js#L29).

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
* In development mode, views are automatically reloaded before render. So there is no need to restart the server for seeing the changes.
* You can use `js` as the engine if you decide not to write your react views in `jsx`.
* [Blog on react-engine](https://www.paypal-engineering.com/2015/04/27/isomorphic-react-apps-with-react-engine/)

### License
[Apache Software License v2.0](http://www.apache.org/licenses/LICENSE-2.0)
