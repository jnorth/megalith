import { $state, $name, $parent, $children, $events, $reducers } from './symbols';
import defineStateProperties from './defineStateProperties';
import events from './events';

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
      value: undefined,
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

    // Instance event subscribers. Each store object holds its own list of
    // action event callbacks.
    Object.defineProperty(this, $events, {
      writable: true,
      value: [],
    });

    // Expose events service
    Object.defineProperty(this, 'events', {
      value: events.createService(this),
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
    defineStateProperties(this, state);
  }

  /**
   * Get the store's complete state tree.
   */
  serialize() {
    const state = this[$state];
    const isBasic = (typeof state !== 'object' || Array.isArray(state));

    if (isBasic) {
      return state;
    }

    const children = Object.keys(this[$children]).reduce((combined, child) => {
      combined[child] = this[$children][child].serialize();
      return combined;
    }, {});

    return {
      ...state,
      ...children,
    };
  }

  /**
   * Dispatch an action.
   *
   * This is handled automatically when calling action methods, but you can use
   * this to replay saved actions or trigger synthetic actions.
   */
  dispatch(action) {
    const dotIndex = action.type.indexOf('.');
    const isChild = dotIndex !== -1;

    this.events.trigger(action, { isChild, before: true });

    // Forward actions to child stores
    if (isChild) {
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

    this.events.trigger(action, { isChild, after: true });

    return this[$state];
  }
}
