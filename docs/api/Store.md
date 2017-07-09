# `megalith.Store`

A store contains application state and action methods. Stores can be nested to
create rich state trees.

#### Properties

  - [`initialState`](#initial-state)
  - [`state`](#state)
  - [`events`](#events)

#### Methods

  - [`dispatch()`](#dispatch)

<br>

## Properties

#### <a id='initial-state'></a>[`initialState`](#initial-state) — _write-only_

This property is used to set the initial state for a store instance. It defines
both the 'shape' and the initial value(s) of your state properties.

If you set an object as the initial state, getters and setters for each property
of that object are generated.

It is write-only, and can only be set once per instance.

##### Example

```js
import { Store } from 'megalith';

class TypicalStore extends Store {
  initialState = {
    version: 1,
    type: 'fancy-app',
  }
}

class ArrayStore extends Store {
  initialStore = [1, 2, 3];
}

class NumberStore extends Store {
  initialState = 0;
}
```

<br>

#### <a id='state'></a>[`state`](#state) — _read-only_

##### Returns

*(any)*: The store's state, not including nested child stores.

<br>

#### <a id='events'></a>[`events`](#events) — _read-only_

##### Returns

*(events)*: An events subscription manager for the store. Used to listen for
action events. See [events](events.md).

<br>

## Methods

#### <a id='dispatch'></a>[`dispatch()`](#dispatch)

Dispatch an action. Actions trigger state changes and are typically created
behind the scenes by calling `@action` methods.

Triggers events.

##### Arguments

  1. `action` *(Object)*: A plain object with `type` and `payload` properties.
     `type` must be a string, and `payload` must be an array. See
     [Action](action.md#action-object).

##### Returns

*(any)*: The store's new state.

<br><hr><h4>Documentation</h4>

  - [Quick Start](/docs/quick-start)
    - [Introduction](/docs/quick-start/1-introduction.md)
    - [State](/docs/quick-start/2-state.md)
    - [Actions](/docs/quick-start/3-actions.md)
    - [Events](/docs/quick-start/4-events.md)

  - [API Reference](/docs/api)
    - Store
    - [action](/docs/api/action.md)
    - [events](/docs/api/events.md)
    - [snapshot](/docs/api/snapshot.md)

  - [Examples](/docs/examples)
    - [Async Actions](/docs/examples/async-actions.md)
    - [ES5 Syntax](/docs/examples/es5.md)
