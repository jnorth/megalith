# State Management

State in megalith is handled by the `Store` class. You'll typically interact
with your application's state in the following ways:

- Set initial state in the constructor
- Access state through auto-generated and custom accessors
- Snapshot full state tree
- Modify state with action methods

## Setting the initial state

`initialState` is a special property on `Store` objects. It defines the 'shape'
of your data. It can only be set once, typically during object instantiation:

```js
class App extends Store {
  constructor() {
    this.initialState = { version: 1.5 };
  }
}
```

> Note: if your environment supports
> [class properties](https://babeljs.io/docs/plugins/transform-class-properties/),
> you can use the following shorthand:

```js
class App extends Store {
  initialState = { version: 1.5 };
}
```

After you instantiate a `Store` object, its `state` property will be set to the
`initialState` you defined. An error will be thrown if you try to re-assign
the `initialState` at any point.

```js
const app = new App();
app.state; // => { version: 1.5 }
app.initialState = {}; // => Error
```

Although setting the `initialState` to an object is typical, you can also use
other values like arrays, strings, and numbers.

```js
class App extends Store {
  initialState = 0;
}

const app = new App();
app.state; // => 0
```

## Accessing state

As you've seen, you can access a `Store`'s state with the `state` property. This
property is read-only, so trying to re-assign it will throw an error.

In addition to the `state` property, shortcut accessors are also added if the
`initialState` is an object. These are read-only as well.

```js
class App extends Store {
  initialState = {
    version: 1.5,
    message: 'Hello!',
  };
}

const app = new App();
app.state; // => { version: 1.5, message: 'Hello!' }
app.version; // => 1.5
app.message; // => 'Hello!'
app.version = 2; // => Error
```

## Custom accessors

Sometimes you want to format your data in a specific way without changing how
the data is stored. You can add new methods to your `Store` class, accessing
the state and returning new values.

```js
class App extends Store {
  initialState: {
    firstName: 'Bob',
    lastName: 'McMann',
  };

  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  // Or, using getter syntax
  get lowerCaseName() {
    return this.getFullName().toLowerCase();
  }
}

const app = new App();
app.getFullName(); // => 'Bob McMann'
app.lowerCaseName; // => 'bob mcmann'
```

## Nested state

It's possible to nest objects in a `Store`'s state:

```js
class App extends Store {
  initialState = {
    messages: {
      lastMessageIndex: 2,
      all: ['a', 'b', 'c'],
    },
  };
}

const app = new App();
app.messages.all[app.messages.lastMessageIndex]; // => 'c'
```

At some point however, it will be more convenient to nest your `Store` objects
themselves. This allows you to separate related actions and state out into a
clean hierarchy.

```js
class MessageStore extends Store {
  initialState: {
    lastMessageIndex: 2,
    all: ['a', 'b', 'c'],
  };

  get lastMessage() {
    return this.all[this.lastMessageIndex];
  }
}

class App extends Store {
  initialState = {
    version: 1.5,
    messages: new MessageStore(),
  };
}

const app = new App();
app.version; // => 1.5
app.messages.all[2]; // => 'c'
app.messages.lastMessage; // => 'c'
```

## Snapshots

When nesting `Store` objects, you'll notice that the child stores do not show up
in the `state` property:

```js
class MessageStore extends Store {
  initialState: {
    lastMessageIndex: 2,
    all: ['a', 'b', 'c'],
  };
}

class App extends Store {
  initialState = {
    version: 1.5,
    messages: new MessageStore(),
  };
}

const app = new App();
app.version; // => 1.5
app.state; // => { version: 1.5 } <- No 'messages' here!
app.messages; // => MessageStore
app.messages.all[0]; // => 'a'
app.messages.state; // => { lastMessageIndex: 2, all: ['a', 'b', 'c'] }
```

To get a clean snapshot of our entire state tree we can use `snapshot.create`.
Any child stores are reduced down to their snapshot-ed state as well:

```js
import { snapshot } from 'megalith';
snapshot.create(app);
// => {
//   version: 1.5,
//   messages: {
//     lastMessageIndex: 2,
//     all: ['a', 'b', 'c']
//   }
// }
```

The return value is ready to be persisted to the server, or tracked as a
undo/redo step.

<br><hr><h4>Documentation</h4>

  - [Quick Start](/docs/quick-start)
    - [Introduction](/docs/quick-start/1-introduction.md)
    - State
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
