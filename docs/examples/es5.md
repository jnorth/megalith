# ES5 Syntax

Although the examples and documentation show megalith being used with modern ES
syntax, you can still use achieve the same results in environments that only
support ES5.

```js
var megalith = require('megalith');

// Create constructor
function App() {
  megalith.Store.call(this);

  this.initialState = {
    version: 1,
    messages: ['a', 'b']
  };
}

// Extend Store
App.prototype = Object.create(megalith.Store.prototype);
App.prototype.constructor = App;

// Define action
megalith.action.define(App.prototype, 'bump', function() {
  return {
    version: this.version + 1,
    messages: this.messages
  };
});

var app = new App();
app.version; // => 1
app.bump();
app.version; // => 2
```

<br><hr><h4>Documentation</h4>

  - [Quick Start](/docs/quick-start)
    - [Introduction](/docs/quick-start/1-introduction.md)
    - [State](/docs/quick-start/2-state.md)
    - [Actions](/docs/quick-start/3-actions.md)
    - [Events](/docs/quick-start/4-events.md)

  - [API Reference](/docs/api)
    - [Store](/docs/api/Store.md)
    - [action](/docs/api/action.md)
    - [events](/docs/api/events.md)
    - [snapshot](/docs/api/snapshot.md)

  - [Examples](/docs/examples)
    - [Async Actions](/docs/examples/async-actions.md)
    - ES5 Syntax
