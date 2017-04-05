/**
 * Create an action path.
 */
function buildActionPath(store) {
  var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

  path.push(store._flax.pathName);

  return store._flax.parent ? buildActionPath(store._flax.parent, path) : path.reverse().filter(function (item) {
    return item;
  }).join('.');
}

var findRoot = function findRoot(store) {
  return store._flax.parent ? findRoot(store._flax.parent) : store;
};

/**
 * A decorator to mark store actions.
 */
function action(target, key, descriptor) {
  var reducer = descriptor.value;
  var reducerName = reducer.name;

  // Save current implementation as the reducer function
  Object.defineProperty(target, '_flax_reducer_' + reducerName, descriptor);

  // Write new implementation as the action creator function
  descriptor.value = function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    findRoot(this).dispatch({
      path: buildActionPath(this),
      type: reducerName,
      payload: args
    });
  };

  return descriptor;
}

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

    this._flax = {
      children: {},
      parent: undefined,
      pathName: undefined,
      state: {},
      subscribers: []
    };
  }

  _createClass(Store, [{
    key: 'serialize',


    /**
     * Get the store's complete state tree.
     */
    value: function serialize() {
      var _this = this;

      if (this._flax.state instanceof Array) {
        return this._flax.state;
      }

      var children = Object.keys(this._flax.children).reduce(function (combined, child) {
        combined[child] = _this._flax.children[child].serialize();
        return combined;
      }, {});

      return _extends({}, this._flax.state, children);
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
      this._flax.subscribers.push(callback);
      callback({
        store: this,
        before: this._flax.state,
        after: this._flax.state,
        action: {
          path: buildActionPath(this),
          type: '@init',
          payload: []
        }
      });
    }

    /**
     * Dispatch an event.
     *
     * This is handled automatically when calling action methods, but you can use
     * this to re-play actions.
     */

  }, {
    key: 'dispatch',
    value: function dispatch(action$$1) {
      var path = buildActionPath(this);
      var before = this._flax.state;

      if (action$$1.path === '') {
        var reducerName = '_flax_reducer_' + action$$1.type;
        var reducer = this[reducerName];

        if (typeof reducer !== 'function') {
          throw new Error('Action not found \'' + this.constructor.name + ':' + action$$1.type + '\'.');
        }

        this._flax.state = this[reducerName].apply(this, action$$1.payload);
      } else {
        var childPath = action$$1.path.split('.');
        var nextPath = childPath.shift();
        var childAction = _extends({}, action$$1, { path: childPath.join('.') });
        this[nextPath].dispatch(childAction);
      }

      var after = this._flax.state;
      var event = {
        store: this,
        action: action$$1,
        before: before,
        after: after
      };

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this._flax.subscribers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var callback = _step.value;
          callback(event);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return after;
    }
  }, {
    key: 'state',


    /**
     * Get the store's state. Does not include the state of child stores—instead
     * access the children directly, or use `serialize`.
     */
    get: function get() {
      return this._flax.state;
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
          _this2._flax.children[property] = value;
          value._flax.parent = _this2;
          value._flax.pathName = property;

          Object.defineProperty(_this2, property, {
            get: function get() {
              return this._flax.children[property];
            }
          });
        }

        // Copy local properties, and create getters
        else {
            _this2._flax.state[property] = state[property];

            Object.defineProperty(_this2, property, {
              get: function get() {
                return this._flax.state[property];
              }
            });
          }
      });
    }
  }]);

  return Store;
}();

export { Store, action };
