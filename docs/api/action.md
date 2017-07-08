# `megalith.action`

Marks [`Store`](Store.md) methods as action methods.

Action methods are expected to return a compete copy of the current state, with
any modifications applied to the copy. The store's state can not be updated
directly.

After being marked as an action method, the store will fire events whenever they
are called.

#### Objects

  - [`Action`](#action-object)

#### Decorators

  - [`@action`](#action-decorator)

#### Functions

  - [`action.define(target, name)`](#action-define)
  - [`action.define(target, name, fn)`](#action-define-2)

<br>

## Objects

#### <a id='action-object'></a>[`Action`](#action-object)

The action object created when calling an action method. Typically this is
auto-generated for you, but you can create your own and dispatch them with
[`Store.dispatch`](Store.md#dispatch).

##### Properties

  - `type` *(String)*: The action name.
  - `payload` *(Array)*: The arguments to pass to the action method. This should
    contain any action-specific data needed to accomplish the task.

<br>

## Decorators

#### <a id='action-decorator'></a>[`@action`](#action-decorator)

A decorator to mark store methods as action methods.

Since decorators are not part of the ES spec yet, you'll need a pre-processor
plugin such as: [babel-plugin-transform-decorators-legacy](https://github.com/loganfsmyth/babel-plugin-transform-decorators-legacy).

##### Example

```js
import { Store, action } from 'megalith';

class App extends Store {
  initialState = 0;

  @action increment() {
    return this.state + 1;
  }
}
```

<br>

## Functions

#### <a id='action-define'></a>[`action.define(target, name)`](#action-define)

Mark an existing method as an action method.

##### Arguments

1. `target` *(Store)*: The target store prototype to define the action method
   onto.
2. `name` *(String)*: The action name. Must be the same as the method name.

##### Returns

*(undefined)*

##### Example

```js
import { Store, action } from 'megalith';

class App extends Store {
  initialState = 0;

  increment() {
    return this.state + 1;
  }
}

action.define(App.prototype, 'increment');
```

<br>

#### <a id='action-define-2'></a>[`action.define(target, name, fn)`](#action-define-2)

Add an action method.

##### Arguments

1. `target` *(Store)*: The target store prototype to define the action method
   onto.
2. `name` *(String)*: The action name.
3. `fn` *(Function)*: An action function. Must return a new state object.

##### Returns

*(undefined)*

##### Example

```js
import { Store, action } from 'megalith';

class App extends Store {
  initialState = 0;
}

action.define(App.prototype, 'increment', function() {
  return this.state + 1;
});
```

<br><hr><h4>Documentation</h4>

  - [Quick Start](/docs/quick-start)
    - [Introduction](/docs/quick-start/1-introduction.md)
    - [State](/docs/quick-start/2-state.md)
    - [Actions](/docs/quick-start/3-actions.md)
    - [Events](/docs/quick-start/4-events.md)

  - [API Reference](/docs/api)
    - [Store](/docs/api/Store.md)
    - action
    - [events](/docs/api/events.md)
    - [snapshot](/docs/api/snapshot.md)

  - [Examples](/docs/examples)
    - [Async Actions](/docs/examples/async-actions.md)
    - [ES5 Syntax](/docs/examples/es5.md)
