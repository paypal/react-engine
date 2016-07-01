### Migration from 3.x to 4.x
4.x version of `react-engine` removes the dependency of `react-dom` from the project. Users of `react-engine` should install `react-dom` along side `react` going forward.

### Migration from 2.x to 3.x
While upgrading to 3.x version of react-engine, make sure to follow the [react-router's 2.x upgrade guide](https://github.com/reactjs/react-router/blob/master/upgrade-guides/v2.0.0.md) to upgrade react-router related code in your app.
Then, add to your express error middleware, react-engine's MATCH_REDIRECT and MATCH_NOT_FOUND checks.

### Migration from 1.x to 2.x
2.x version of react-engine brought in a major api change. Basically it affects the property names of the [object that gets passed in during the engine creation](https://github.com/paypal/react-engine#server-options-spec) on the server side and also how routes definition is passed into react-engine.

In v2.x, `routes` need to be explicitly required and passed in to the engine creation method. Also, any [react-router known properties can be passed in](https://github.com/reactjs/react-router/blob/0.13.x/doc/02%20Top-Level/Router.create.md).

An example engine creation can be found [here](https://github.com/paypal/react-engine/blob/71ac27196e72059484332a491cd66982797a60a3/examples/complex/index.js#L28).
