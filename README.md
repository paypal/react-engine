# react-engine

### What is react-engine?
* a composite render engine for express apps to render both plain react views and react-router views on server
* enables server rendered views to be client mountable


### Install
```sh
  npm install react-engine --save
```

### Usage On Server Side
###### Configuration (Express)
```javascript
    var express = require('express');
    var app = express();

    // create the view engine with `react-engine`
    var engine = require('react-engine').server.create({
      reactRoutes: <string> /* pass in the path to react-router routes optionally */
    });

    // set the engine
    app.engine('.jsx', engine);

    // set the view directory
    app.set('views', __dirname + '/views');

    // set jsx as the view engine
    // Without this you would need to
    // supply the extension to res.render()
    // ex: res.render('index.jsx').
    app.set('view engine', 'jsx');

    // finally, set the custom view
    app.set('view', require('react-engine/lib/expressView'));
```

###### Configuration (if you prefer KrakenJS - http://krakenjs.com)
```json
  {
    "express": {
        "view engine": "jsx",
        "view": "path:./node_modules/react-engine/lib/expressView",
    },
    "view engines": {
        "jsx": {
            "module": "react-engine/lib/server",
            "renderer": {
              "method": "create",
                "arguments": [{
                    "reactRoutes": "path:<PATH_TO_REACT-ROUTER_ROUTES>"
                }]
            }
        }
    }
  }
```

###### Rendering
```js
var data = {}; // your data model

// for normal view rendering
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

// boot options
var options = {
    react: require('react'),
    router: require('react-router'),
    routes: <PATH_TO_REACT-ROUTER_ROUTES>,
    // supply a function that can be called to resolve the file that was rendered
    viewResolver: function(viewName) {
        return <THE RESOLVED VIEW>; //Example: return require('./views/' + viewName);
    }
};

// finally, boot whenever you are ready
// example:
document.addEventListener('DOMContentLoaded', function onLoad() {
  client.boot(options);
};
```

### Notes
* On the client side, the state is exposed on the window object's property `__REACT_ENGINE__`
* In development mode, views are automatically reloaded before render. So there is no need to restart the server for seeing the changes.

### License
[Apache Software License v2.0](http://www.apache.org/licenses/LICENSE-2.0)
