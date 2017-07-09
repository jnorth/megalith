# `megalith.Store.events`

Subscribe to store events.

[`Store`](Store.md) objects fire events before and after each action.

#### Objects

  - [`Event`](#events-object)

#### Functions

  - [`events.on(subscriber)`](#events-on)
  - [`events.off(blueprint)`](#events-off)
  - [`events.all(handler)`](#events-all)

<br>

## Objects

#### <a id='events-object'></a>[`Event`](#events-object)

When an action is dispatched, an event object is created and passed to any
handlers.

##### Properties

  - `store` *(Store)*: The store object the action was dispatched to.
  - `action` *(Action)*: The [`action object`](action.md#action-object) that was
    dispatched.
  - `context` *(any)*: The context that was passed to `events.on`.

<br>

## Functions

#### <a id='events-on'></a>[`events.on(subscriber)`](#events-on)

Add an event subscriber to a Store object.

##### Arguments

1. `subscriber` *(Object)*: An object with the following properties:

   - `handler` *(Function)*: The event handler. This will be called any time a
     matching action has been called.

   - `[type]` *(String)*: The action type to listen for.

   - `[tag]` *(any)*: A reference that can be used when removing event
     listeners. For example, if I use a string `'my-events'` for several events,
     passing the tag into the `events.off()` function will remove all events
     with that tag.

   - `[before=false]` *(Boolean)*: True if the handler should fire _before_ the
     action is executed.

   - `[after=true]` *(Boolean)*: True if the handler should fire _after_ the
     action is executed.

   - `[bubble=false]` *(Boolean)*: True if the handler should fire for actions
     meant for child stores.

   - `[context]` *(any)*: Custom data to be passed to the event handler. Will be
     accessible through `event.context`.

##### Returns

*(subscription)*: A reference you can pass to `events.off` to remove the
handler.

<br>

#### <a id='events-off'></a>[`events.off(blueprint)`](#events-off)

Remove an event subscriber from a Store object.

##### Arguments

1. `blueprint` *(Object)*: An object with any of the following properties:

   - `[handler]` *(Function)*: Remove any subscribers with the same handler
     function.

   - `[type]` *(String)*: Remove any subscribers with the same type.

   - `[tag]` *(any)*: Remove any subscribers with the same tag.

   - `[before=false]` *(Boolean)*: Remove any subscribers with the same value.

   - `[after=true]` *(Boolean)*: Remove any subscribers with the same value.

   - `[bubble=false]` *(Boolean)*: Remove any subscribers with the same value.

##### Returns

*(undefined)*

<br>

#### <a id='events-all'></a>[`events.all(handler)`](#events-all)

This is a convenience function for adding an event handler for all events, with
`bubble` set to `true`.

It also fires a special `@init` action right after subscribing.

##### Arguments

1. `handler` *(Function)*: The event handler.

##### Returns

*(subscription)*: A reference you can pass to `events.off` to remove the
handler.

##### Example

```jsx
import { Store, snapshot } from 'megalith';

class App extends Store { ... }
const app = new App();

// Fires right away, and after every action
app.events.all(event => renderMyApp(snapshot.create(event.store)));
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
    - events
    - [snapshot](/docs/api/snapshot.md)

  - [Examples](/docs/examples)
    - [Async Actions](/docs/examples/async-actions.md)
    - [ES5 Syntax](/docs/examples/es5.md)
