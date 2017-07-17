# Quick Start

## Installation

Install Megalith through [npm](https://www.npmjs.com/package/megalith) or a
[CDN](https://unpkg.com/megalith@latest).

`npm install --save megalith`

## Import

ES6 module:

`import * as megalith from 'megalith';`

CommonJS:

`var megalith = require('megalith');`

Script tag:

`<script src="https://unpkg.com/megalith@latest"></script>`

## Usage

Start off by extending the Megalith `Store` class and setting some initial
state:

```js
import { Store } from 'megalith';

class App extends Store {
  // Set the initial state
  // Typically an object is used but numbers, strings, and arrays also work
  initialState = {
    counter: 0,
  };
}

const app = new App();
app.counter; // => 0
app.state; // => { counter: 0 }
```

> Note: while you can use megalith without ES6+ syntax and features
> ([see ES5](../examples/es5.md)), we are using them throughout these examples.
> Read up on [classes](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Classes),
> [class properties](https://babeljs.io/docs/plugins/transform-class-properties/),
> [modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import),
> [object spreads](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Operators/Spread_operator),
> and [decorators](https://medium.com/google-developers/exploring-es7-decorators-76ecb65fb841).

Next, let's add an action method.

The `@action` decorator is used to mark which methods change application state.
Instead of mutating the state directly however, action methods return a mutated
copy of the current state:

```js
import { Store, action } from 'megalith';

class App extends Store {
  initialState = {
    counter: 0,
  };

  @action increment() {
    // Return a mutated copy of the entire state object
    return {
      ...this.state,
      counter: this.counter + 1,
    };
  }
}

const app = new App();
app.increment();
app.counter; // => 1
```

When we call `increment()`, our method is hijacked and an action is created and
dispatched to our `App` store instead. The store then calls our action method,
replacing the state with the return value.

The action itself would look something like:

```js
{
  // The action type matches the action method name
  type: 'increment',
  // The action payload holds the arguments you passed into the action method
  payload: []
}
```

To illustrate how actions work we can `dispatch` our own actions:

```js
const app = new App();
app.counter; // => 0
app.dispatch({ type:'increment', payload:[] });
app.counter; // => 1
```

We can also keep track of what actions are called by subscribing to a `Store`:

```js
const app = new App();

app.events.on({
  type: 'increment',
  handler: event => {
    event.action.type === 'increment'; // => true
    event.store === app; // => true
  },
});

app.increment();
```

If we like, we can save the complete application state after each event as a
powerful debugging tool or an easy undo/redo feature.

```js
import { snapshot } from 'megalith';

const app = new App();
const history = [];
app.events.all(event => history.push(snapshot.create(event.store)));
app.increment();

history; // => [{ count:0 }, { count:1 }]
```

<br><hr><h4>Documentation</h4>

  - [Quick Start](/docs/quick-start)
    - Introduction
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
    - [ES5 Syntax](/docs/examples/es5.md)
