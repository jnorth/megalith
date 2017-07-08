# Actions

Application state should only be changed using actions. Megalith actions are
very similar to Redux or Flux actions—they are just objects with a `type`
property and optionally some extra parameters. In megalith, they look something
like:

```js
{
  type: 'setVersion',
  payload: [2],
}
```

Having plain objects represent actions, and knowing state can only be changed
as a result of an action, we get some nice behaviors by default:

  - Actions can be logged, stored, and re-played
  - Actions mark safe snapshots of our application's state
  - State snapshots can be taken, stored, and applied after each action

Unlike Redux however, we don't typically create action objects ourselves.
Looking at the above action again, we can see it would be trivial to represent
it as a function call:

```js
setVersion(2);
```

This is exactly what megalith does.

## Action handlers

So, action objects describe what happened, but they don't change state
themselves. Something needs to listen for these actions and do the dirty work.
Megalith uses action handlers for this.

Action handlers are designed to be pure functions that accept any number of
parameters and return a new mutated copy of the current state. They should not
(and can not) mutate the state directly. Looking at our example above, we could
implement the action handler like:

```js
const app = {
  version: 1,
  message: 'Hello world!',
};

function setVersion(state, version) {
  return { ...state, version };
}

const newState = setVersion(app, 2);
app; // => { version: 1, message: 'Hello world!' }
newState; // => { version: 2, message: 'Hello world!' }
```

`setVersion` doesn't change the `state` variable directly—instead it takes the
current state and returns a modified copy. This is nice because it lets us
reason about our state changes in a deterministic way.

But, even though megalith conceptually works like the above code, we don't
actually manage our state manually. Instead, we wrap our state in a `Store`
class and write action handlers as methods:

```js
import { Store, action } = 'megalith';

class App extends Store {
  initialState = {
    version: 1,
    message: 'Hello world!',
  };

  @action setVersion(version) {
    return { ...this.state, version };
  }
}

const app = new App();
app.version; // => 1
app.setVersion(2);
app.version; // => 2
```

Behind the scenes, our `app.setVersion(2)` call gets converted into the
following steps:

  - *Create action object*—the method name is used as the action type, and the
    method arguments are used as its payload.

    ```js
    {
      type: 'setVersion',
      payload: [2],
    }
    ```

  - *Dispatch action*—the action object is passed to the store's `dispatch`
    method.

    ```js
    app.dispatch({ type:'setVersion', payload:[2] })
    ```

  - *Execute action method*—the code inside our `setVersion` method is run being
    passed the action payload as arguments. The return value replaces the
    store's state.

    ```js
    // This won't actually work, but shows the general idea
    app.state = app.setVersion(2);
    ```

<br><hr><h4>Documentation</h4>

  - [Quick Start](/docs/quick-start)
    - [Introduction](/docs/quick-start/1-introduction.md)
    - [State](/docs/quick-start/2-state.md)
    - Actions
    - [Events](/docs/quick-start/4-events.md)

  - [API Reference](/docs/api)
    - [Store](/docs/api/Store.md)
    - [action](/docs/api/action.md)
    - [events](/docs/api/events.md)
    - [snapshot](/docs/api/snapshot.md)

  - [Examples](/docs/examples)
    - [Async Actions](/docs/examples/async-actions.md)
    - [ES5 Syntax](/docs/examples/es5.md)
