<h3 align="center">Megalith</h3>

<p align="center"><i>
The small and straightforward JavaScript state container.
</i></p>

Megalith allows you to arrange your application state into a nested tree of
`Store` objects, each encapsulating related state and actions. It can be
considered an implementation of ideas from Redux and mobx-state-tree, with a
lightweight class-based API.

## Overview

Megalith has the same three core concepts as many other state containers:

> 1. Application state is stored in a single object tree.

> 2. You mark your intent to change state by dispatching actions. Actions are
> simple objects with a `type` and optionally some parameters.

> 3. Given an action and the previous state, a new state tree is generated using
> a simple function.

The implementation differs however, with actions being created automatically
from `action` methods and state being organized into a tree of `Store` classes.
This allows you to retain most benefits from a more functional approach, while
reducing boilerplate and keeping related code together.

## Example

```js
import { Store, action, snapshot } from 'megalith';

class App extends Store {
  // Set our store's initial state. This defines its 'shape' and default values.
  initialState = {
    counter: 0,
    messages: new MessagesStore(), // Stores can be nested.
  };

  // Action methods are the only way to change store state. They can be called
  // like regular methods, and are expected to return a modified copy of the
  // entire state object.
  @action increment(n=1) {
    return { ...this.state, counter: this.counter + n };
  }
}

class MessagesStore extends Store {
  // Store state is typically an object, but can be an array, string, number,
  // or any other type of data.
  initialState = [];

  @action add(message) {
    return [...this.state, message];
  }
}

const app = new App();

// State properties can be accessed like regular (read-only) properties.
app.counter; // => 0

// Action methods are called like regular methods.
app.increment(5);
app.messages.add('hello world!');

// Action methods trigger events
app.events.all(event => {
  event.action; // => { type: 'messages.add', payload: ['hello world!'] }

  // Snapshots of the entire state tree can be taken at any point.
  snapshot.create(event.store); // => { counter: 5, messages: ['hello world!'] }
});
```

## Documentation

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
    - [ES5 Syntax](/docs/examples/es5.md)

## License

Copyright (c) 2016 Joseph North

Megalith is licensed under the [MIT License](LICENSE.md).
