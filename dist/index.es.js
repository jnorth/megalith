function createSymbol(name) {
  return typeof Symbol === 'function' ? Symbol.for(name) : '_' + name;
}

var $state = createSymbol('flaxState');
var $name = createSymbol('flaxName');
var $parent = createSymbol('flaxParent');
var $children = createSymbol('flaxChildren');
var $subscribers = createSymbol('flaxSubscribers');
var $reducers = createSymbol('flaxReducers');

var defaultSubscriber = {
  tag: undefined,
  type: undefined,
  init: false,
  before: false,
  after: true,
  bubble: true,
  context: undefined
};

function addSubscriber(store, subscriber) {
  // Convert bare functions into subscriber objects
  if (typeof subscriber === 'function') {
    subscriber = { handler: subscriber };
  }

  // Assign default properties
  subscriber = Object.assign({}, defaultSubscriber, subscriber);

  // Register subscriber
  store[$subscribers].push(subscriber);

  // Trigger init event
  if (subscriber.init) {
    subscriber.handler({
      store: store,
      action: {
        type: '@init',
        payload: []
      }
    });
  }

  return subscriber;
}

function removeSubscriber(store, blueprint) {
  var isFunction = typeof blueprint === 'function';
  var properties = isFunction ? [] : Object.keys(blueprint);

  store[$subscribers] = store[$subscribers].filter(function (subscriber) {
    // Fast path -- equality test
    if (subscriber === blueprint) return false;

    // Fast path -- blueprint is a handler function
    if (isFunction && blueprint === subscriber.handler) return false;

    // Regular path -- all blueprint properties need to match the subscriber
    return properties.reduce(function (keep, property) {
      if (keep === false) return false;
      return blueprint[property] !== subscriber[property];
    }, true);
  });
}

function triggerSubscriberEvent(store, action) {
  var meta = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  store[$subscribers].forEach(function (subscriber) {
    var event = { store: store, action: action, context: subscriber.context };

    // Skip non-matching types
    if (subscriber.type && subscriber.type !== action.type) return;

    // Skip events not targeted to our specific store
    if (!subscriber.bubble && meta.isChild) return;

    // Fire events
    if (subscriber.before && meta.before) subscriber.handler(event);
    if (subscriber.after && meta.after) subscriber.handler(event);
  });
}

function createSubscriptionService(target) {
  var service = function service(handler) {
    return addSubscriber(target, { init: true, handler: handler });
  };
  service.on = function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return addSubscriber.apply(undefined, [target].concat(args));
  };
  service.off = function () {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return removeSubscriber.apply(undefined, [target].concat(args));
  };
  service.trigger = function () {
    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    return triggerSubscriberEvent.apply(undefined, [target].concat(args));
  };
  return service;
}

var subscription = {
  createService: createSubscriptionService
};

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
      writable: true,
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
     *
     * @return {subscriptionService}
     */

  }, {
    key: 'dispatch',


    /**
     * Dispatch an event.
     *
     * This is handled automatically when calling action methods, but you can use
     * this to replay saved actions or trigger synthetic actions.
     */
    value: function dispatch(action) {
      var dotIndex = action.type.indexOf('.');
      var isChild = dotIndex !== -1;

      this.subscribe.trigger(action, { isChild: isChild, before: true });

      // Forward actions to child stores
      if (isChild) {
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

      this.subscribe.trigger(action, { isChild: isChild, after: true });

      return this[$state];
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
  }, {
    key: 'subscribe',
    get: function get() {
      // On first access, create a new subscription service
      var service = subscription.createService(this);

      // Cache the service for repeat accesses
      Object.defineProperty(this, 'subscribe', {
        value: service
      });

      return service;
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
