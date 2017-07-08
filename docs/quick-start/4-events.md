# Events

One of the main reasons to use a state management library like megalith is so
you can watch for changes in your application's state. Megalith `Store` objects
emit events for each action dispatch, and provide a few ways to listen for the
events you are interested in.

## Subscribing

First, let's set up a quick `Store` class to work with:

```js
import { Store, action } from 'megalith';

class App extends Store {
  initialState = {
    version: 1,
  };

  @action setVersion(version) {
    return { ...this.state, version };
  }
}

const app = new App();
```

Now, the simplest way to subscribe to events is to call `events.on` with a
handler function:

```js
app.events.on({
  handler: event => console.log(event),
});
```

If you don't tell it which action you are interested in, it will fire for all
actions. Let's change it so we only listen for the `setVersion` action.

```js
app.events.on({
  type: 'setVersion',
  handler: event => console.log(event),
});
```

By default, the handler fires _after_ the action updates the store's state. You
can change this behavior with the `before` and `after` options:

```js
app.events.on({
  type: 'setVersion',
  before: true,
  after: false,
  handler: event => console.log(event),
});
```

To remove event handlers, we use `events.off`. The simplest way to use it is to
pass in the return value from a `events.on` call.

```js
const subscription = app.events.on({
  handler: event => console.log(event),
});

app.events.off(subscription);
```

But often it can be cumbersome to keep track of all the individual subscriptions
we have active, so `events.off` also has a powerful matching system:

```js
const handler = event => console.log(event);
app.events.on({ handler, type: 'setVersion' });

// Remove all events that have the same handler function
app.events.off({ handler });

// Remove all events that are subscribed to a specific action type
app.events.off({ type: 'setVersion' });

// Remove all events that fire before the action is executed
app.events.off({ before: true });
```

Lastly, we can also tag event subscriptions which groups them together by name:

```js
const handler = event => console.log(event);
app.events.on({ handler, type: 'setVersion' });

app.events.on({
  tag: 'my-events',
  handler: event => console.log(event),
});

app.events.on({
  tag: 'my-events',
  type: 'setVersion',
  handler: event => alert(event),
});

// Remove all events with the 'my-events' tag
app.events.off({
  tag: 'my-events',
});
```

## Triggering Events

Since events are only fired for action dispatches currently, the only public
way to trigger an event is by calling `Store.dispatch` with an action.

<br><hr><h4>Documentation</h4>

  - [Quick Start](/docs/quick-start)
    - [Introduction](/docs/quick-start/1-introduction.md)
    - [State](/docs/quick-start/2-state.md)
    - [Actions](/docs/quick-start/3-actions.md)
    - Events

  - [API Reference](/docs/api)
    - [Store](/docs/api/Store.md)
    - [action](/docs/api/action.md)
    - [events](/docs/api/events.md)
    - [snapshot](/docs/api/snapshot.md)

  - [Examples](/docs/examples)
    - [Async Actions](/docs/examples/async-actions.md)
    - [ES5 Syntax](/docs/examples/es5.md)
