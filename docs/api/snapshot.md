# `megalith.snapshot`

Create a state snapshot from a tree of store objects.

The `state` property on a store instance returns all of its state, but doesn't
include child stores. If you have a nested tree of stores you can use
`snapshot.create` to get the complete state tree.

Likewise, you can apply a state tree to stores using `snapshot.apply`.

#### Functions

  - [`create`](#create)
  - [`apply`](#apply)

#### Symbols

  - [`$serializer`](#serializer)
  - [`$deserializer`](#deserializer)

<br>

## Functions

#### <a id='create'></a>[`create(store)`](#create)

Returns a store's state, along with the state of all children stores.

If a store implements a `[$serializer]` method, the return value of that method
will be used in place of the store's state.

##### Arguments

  1. `store` *(Store)*: The store instance to snapshot.

##### Returns

*(any)*: The complete state tree, including collapsed child stores.

<br>

#### <a id='apply'></a>[`apply(store, state)`](#apply)

Set a store's state, and the state of all children stores.

If the store implements a `[$deserializer]` method, the return value of
that will be used for the replacement state.

##### Arguments

  1. `store` *(Store)*: The store instance to apply state to.
  2. `state` *(any)*: The state.

##### Returns

*(undefined)*

<br>

## Symbols

#### <a id='serializer'></a>[`$serializer`](#serializer)

The `snapshot.$serializer` symbol specifies a custom store method that is used
in place of the `state` property when creating a snapshot.

##### Example

```js
import { Store, snapshot } from 'megalith';

class App extends Store {
  initialState = {
    createDate: new Date(),
  };

  [snapshot.$serializer]() {
    return {
      ...this.state,
      createDate: this.createDate.toJSON(),
    };
  }
}

const app = new App();
snapshot.create(app); // => { createDate: '1985-10-25T01:21:27.051Z' }
```

<br>

#### <a id='deserializer'></a>[`$deserializer`](#deserializer)

The `snapshot.$deserializer` symbol specifies a custom store method that is used
to sanitize and deserialize incoming state data when `snapshot.apply` is called.

The method must return an object that has the same _shape_ as the store's
`initialState`.

##### Example

```js
import { Store, snapshot } from 'megalith';

class App extends Store {
  initialState = {
    createDate: new Date(),
  };

  [snapshot.$deserializer](state) {
    return {
      ...state,
      createDate: parseDate(state.createDate),
    };
  }
}

const app = new App();
snapshot.apply(app, {
  createDate: '1985-10-25T01:21:27.051Z',
});
app.createDate.getFullYear(); // => 1985
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
    - snapshot

  - [Examples](/docs/examples)
    - [Async Actions](/docs/examples/async-actions.md)
    - [ES5 Syntax](/docs/examples/es5.md)
