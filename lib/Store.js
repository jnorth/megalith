import action from './action';
import buildActionPath from './buildActionPath';

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
  _flax = {
    children: [],
    parent: undefined,
    pathName: undefined,
    state: undefined,
    subscribers: [],
  }

  constructor() {
    // Prime the children
    for (let a in this) if (this[a] instanceof Store) this[a];
  }

  /**
   * Get the store's state. Does not include the state of child stores—instead
   * access the children directly, or use `serialize`.
   */
  get state() {
    return this._flax.state;
  }

  /**
   * Set the intial state of the store. Can only be called once, to instantiate
   * the store.
   *
   * @param {object} state
   */
  set initialState(state) {
    this._flax.state = state;

    Object.defineProperty(this, 'initialState', {
      set() {
        throw new Error(`Cannot re-initialize state on store '${this.constructor.name}'.`);
      },
    });
  }

  /**
   * Get the store's complete state tree.
   */
  serialize() {
    if (this._flax.state instanceof Array) {
      return this._flax.state;
    }

    const children = this._flax.children.reduce((combined, child) => {
      combined[child] = this[child].serialize();
      return combined;
    }, {});

    return {
      ...this._flax.state,
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
    this._flax.subscribers.push(callback);
    callback({
      store: this,
      before: this._flax.state,
      after: this._flax.state,
      action: {
        path: buildActionPath(this),
        type: '@init',
        payload: [],
      },
    });
  }

  /**
   * Dispatch an event.
   *
   * This is handled automatically when calling action methods, but you can use
   * this to re-play actions.
   */
  dispatch(action) {
    const path = buildActionPath(this);
    const before = this._flax.state;

    if (action.path === '') {
      const reducerName = `_flax_reducer_${action.type}`;
      const reducer = this[reducerName];

      if (typeof reducer !== 'function') {
        throw new Error(`Action not found '${this.constructor.name}:${action.type}'.`);
      }

      this._flax.state = this[reducerName].apply(this, action.payload);
    } else {
      const childPath = action.path.split('.');
      const nextPath = childPath.shift();
      const childAction = { ...action, path: childPath.join('.') };
      this[nextPath].dispatch(childAction);
    }

    const after = this._flax.state;
    const event = {
      store: this,
      action,
      before,
      after,
    };

    for (let callback of this._flax.subscribers) callback(event);

    return after;
  }
}
