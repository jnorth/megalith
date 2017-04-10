function createSymbol(name) {
  return typeof Symbol === 'function' ? Symbol.for(name) : '_' + name;
}

var $state = createSymbol('flaxState');
var $name = createSymbol('flaxName');
var $parent = createSymbol('flaxParent');
var $children = createSymbol('flaxChildren');
var $subscribers = createSymbol('flaxSubscribers');
var $reducers = createSymbol('flaxReducers');

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Callback for store change events.
 *
 * @callback subscriptionCallback
 * @param {object} event
 */

/**
 * The base store class.
 */

var Store = function () {
  function Store() {
    _classCallCheck(this, Store);

    // Create instance metadata. These are used internally to keep track of
    // store state for quick access, and other metadata. These are considered
    // to be a part of the library's private API, and shouldn't need to be
    // accessed/modified. They are created to be non-enumerable.

    // Instance state. Holds all properties that should be tracked by the Store
    // object. This allows other properties to be added to a Store object
    // without affecting serialization.
    Object.defineProperty(this, $state, {
      value: {},
      writable: true
    });

    // Instance action path name. For child stores, this is set to the name it
    // is referenced as in the parent. Used to create action names.
    Object.defineProperty(this, $name, {
      value: undefined,
      writable: true
    });

    // Parent store. For child stores, this is set to the parent store. Used to
    // find the root store object, which is where we want to dispatch actions.
    Object.defineProperty(this, $parent, {
      value: undefined,
      writable: true
    });

    // Children stores. Holds all children stores, allowing easy serialization.
    Object.defineProperty(this, $children, {
      value: {}
    });

    // Instance subscribers. Each store object holds its own list of action
    // event callbacks.
    Object.defineProperty(this, $subscribers, {
      value: []
    });
  }

  /**
   * Get the store's state. Does not include the state of child stores—instead
   * access the children directly, or use `serialize`.
   */


  _createClass(Store, [{
    key: 'serialize',


    /**
     * Get the store's complete state tree.
     */
    value: function serialize() {
      var _this = this;

      if (this[$state] instanceof Array) {
        return this[$state];
      }

      var children = Object.keys(this[$children]).reduce(function (combined, child) {
        combined[child] = _this[$children][child].serialize();
        return combined;
      }, {});

      return _extends({}, this[$state], children);
    }

    /**
     * Subscribe to state changes.
     *
     * @param {subscriptionCallback} callback
     *        The callback that will be called when the state changes.
     */

  }, {
    key: 'subscribe',
    value: function subscribe(callback) {
      this[$subscribers].push(callback);

      callback({
        store: this,
        before: this[$state],
        after: this[$state],
        action: {
          type: '@init',
          payload: []
        }
      });
    }

    /**
     * Dispatch an event.
     *
     * This is handled automatically when calling action methods, but you can use
     * this to replay saved actions or trigger synthetic actions.
     */

  }, {
    key: 'dispatch',
    value: function dispatch(action) {
      var before = this[$state];
      var dotIndex = action.type.indexOf('.');

      // Forward actions to child stores
      if (dotIndex !== -1) {
        var child = action.type.substring(0, dotIndex);
        var type = action.type.substring(dotIndex + 1);
        this[child].dispatch(_extends({}, action, { type: type }));
      }

      // Handle actions meant for the current store
      else {
          var reducer = this[$reducers][action.type];

          if (typeof reducer !== 'function') {
            throw new Error('Action not found \'' + this.constructor.name + ':' + action.type + '\'.');
          }

          this[$state] = reducer.apply(this, action.payload);
        }

      // Create event and notify subscribers
      var after = this[$state];
      var event = { store: this, action: action, before: before, after: after };
      this[$subscribers].forEach(function (subscriber) {
        return subscriber(event);
      });

      return after;
    }
  }, {
    key: 'state',
    get: function get() {
      return this[$state];
    }

    /**
     * Set the intial state of the store. Can only be called once, to instantiate
     * the store.
     *
     * @param {object} state
     */

  }, {
    key: 'initialState',
    set: function set(state) {
      var _this2 = this;

      // Override setter
      Object.defineProperty(this, 'initialState', {
        set: function set() {
          throw new Error('Cannot re-initialize state on store \'' + this.constructor.name + '\'.');
        }
      });

      // Initialize properties
      Object.keys(state).forEach(function (property) {
        var value = state[property];

        // Track child stores
        if (value instanceof Store) {
          _this2[$children][property] = value;
          value[$parent] = _this2;
          value[$name] = property;

          Object.defineProperty(_this2, property, {
            enumerable: true,
            get: function get() {
              return this[$children][property];
            }
          });
        }

        // Copy local properties, and create getters
        else {
            _this2[$state][property] = value;

            Object.defineProperty(_this2, property, {
              enumerable: true,
              get: function get() {
                return this[$state][property];
              }
            });
          }
      });
    }
  }]);

  return Store;
}();

/**
 * Find the root object of a Store tree.
 * @param {Store} store
 *
 * @return {Object}
 *         An object containing the root `store` item, and the `path` it took
 *         to get there.
 */
function findRoot(store) {
  var path = '';

  while (true) {
    // Stop if this store is not mounted as a child
    if (!store[$name]) break;

    // Add child store to path
    path = path.length ? store[$name] + '.' + path : store[$name];

    // Traverse to parent store
    if (!store[$parent]) break;
    store = store[$parent];
  }

  return { store: store, path: path };
}

/**
 * A decorator to mark store actions.
 */
function action(target, key, descriptor) {
  // Save current implementation as the reducer function
  target[$reducers] = target[$reducers] || {};
  Object.defineProperty(target[$reducers], key, descriptor);

  // Write new implementation as the action creator function
  descriptor.value = function () {
    for (var _len = arguments.length, payload = Array(_len), _key = 0; _key < _len; _key++) {
      payload[_key] = arguments[_key];
    }

    var root = findRoot(this);
    var type = root.path.length ? root.path + '.' + key : key;
    root.store.dispatch({ type: type, payload: payload });
  };

  return descriptor;
}

export { Store, action };
