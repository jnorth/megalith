import action from './action';
import { $state, $name, $parent, $children, $subscribers, $reducers } from './symbols';

/**
 * Callback for store change events.
 *
 * @callback subscriptionCallback
 * @param {object} event
 */

/**
 * The base store class.
 */
export default class Store {
  constructor() {
    // Create instance metadata. These are used internally to keep track of
    // store state for quick access, and other metadata. These are considered
    // to be a part of the library's private API, and shouldn't need to be
    // accessed/modified. They are created to be non-enumerable.

    // Instance state. Holds all properties that should be tracked by the Store
    // object. This allows other properties to be added to a Store object
    // without affecting serialization.
    Object.defineProperty(this, $state, {
      value: {},
      writable: true,
    });

    // Instance action path name. For child stores, this is set to the name it
    // is referenced as in the parent. Used to create action names.
    Object.defineProperty(this, $name, {
      value: undefined,
      writable: true,
    });

    // Parent store. For child stores, this is set to the parent store. Used to
    // find the root store object, which is where we want to dispatch actions.
    Object.defineProperty(this, $parent, {
      value: undefined,
      writable: true,
    });

    // Children stores. Holds all children stores, allowing easy serialization.
    Object.defineProperty(this, $children, {
      value: {},
    });

    // Instance subscribers. Each store object holds its own list of action
    // event callbacks.
    Object.defineProperty(this, $subscribers, {
      value: [],
    });
  }

  /**
   * Get the store's state. Does not include the state of child stores—instead
   * access the children directly, or use `serialize`.
   */
  get state() {
    return this[$state];
  }

  /**
   * Set the intial state of the store. Can only be called once, to instantiate
   * the store.
   *
   * @param {object} state
   */
  set initialState(state) {
    // Override setter
    Object.defineProperty(this, 'initialState', {
      set() {
        throw new Error(`Cannot re-initialize state on store '${this.constructor.name}'.`);
      },
    });

    // Initialize properties
    Object.keys(state).forEach(property => {
      const value = state[property];

      // Track child stores
      if (value instanceof Store) {
        this[$children][property] = value;
        value[$parent] = this;
        value[$name] = property;

        Object.defineProperty(this, property, {
          enumerable: true,
          get() { return this[$children][property]; },
        });
      }

      // Copy local properties, and create getters
      else {
        this[$state][property] = value;

        Object.defineProperty(this, property, {
          enumerable: true,
          get() { return this[$state][property]; },
        });
      }
    });
  }

  /**
   * Get the store's complete state tree.
   */
  serialize() {
    if (this[$state] instanceof Array) {
      return this[$state];
    }

    const children = Object.keys(this[$children]).reduce((combined, child) => {
      combined[child] = this[$children][child].serialize();
      return combined;
    }, {});

    return {
      ...this[$state],
      ...children,
    };
  }

  /**
   * Subscribe to state changes.
   *
   * @param {subscriptionCallback} callback
   *        The callback that will be called when the state changes.
   */
  subscribe(callback) {
    this[$subscribers].push(callback);

    callback({
      store: this,
      before: this[$state],
      after: this[$state],
      action: {
        type: '@init',
        payload: [],
      },
    });
  }

  /**
   * Dispatch an event.
   *
   * This is handled automatically when calling action methods, but you can use
   * this to replay saved actions or trigger synthetic actions.
   */
  dispatch(action) {
    const before = this[$state];
    const dotIndex = action.type.indexOf('.');

    // Forward actions to child stores
    if (dotIndex !== -1) {
      const child = action.type.substring(0, dotIndex);
      const type = action.type.substring(dotIndex + 1);
      this[child].dispatch({ ...action, type });
    }

    // Handle actions meant for the current store
    else {
      const reducer = this[$reducers][action.type];

      if (typeof reducer !== 'function') {
        throw new Error(`Action not found '${this.constructor.name}:${action.type}'.`);
      }

      this[$state] = reducer.apply(this, action.payload);
    }

    // Create event and notify subscribers
    const after = this[$state];
    const event = { store: this, action, before, after };
    this[$subscribers].forEach(subscriber => subscriber(event));

    return after;
  }
}
