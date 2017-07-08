import defineProperty from './defineProperty';
import { $name, $parent, $reducers } from './symbols';

/**
 * Find the root object of a Store tree.
 * @param {Store} store
 *
 * @return {Object}
 *         An object containing the root `store` item, and the `path` it took
 *         to get there.
 */
function findRoot(store) {
  let path = '';

  while (true) {
    // Stop if this store is not mounted as a child
    if (!store[$name]) break;

    // Add child store to path
    path = path.length
      ? `${store[$name]}.${path}`
      : store[$name];

    // Traverse to parent store
    if (!store[$parent]) break;
    store = store[$parent];
  }

  return { store, path };
};

/**
 * A decorator to mark Store methods as "action" methods.
 *
 * Any state changes should be wrapped in an action method. Instead of mutating
 * the state directly however, action methods return a new copy of the entire
 * state object.
 *
 * @param {Store} target
 *        The target store object to define the action method onto.
 *
 * @param {String} key
 *        The action name.
 *
 * @param {Object} descriptor
 *        The function descriptor.
 */
function action(target, key, descriptor) {
  // Save current implementation as the reducer function
  target[$reducers] = target[$reducers] || {};
  defineProperty(target[$reducers], key, descriptor);

  // Write new implementation as the action creator function
  descriptor.value = function(...payload) {
    const root = findRoot(this);
    const type = root.path.length
      ? `${root.path}.${key}`
      : key;
    root.store.dispatch({ type, payload });
  };

  return descriptor;
};

/**
 * Define an action method for a target Store object.
 *
 * This can be used in place of the action decorator.
 *
 * @param {Store} target
 *        The target store object to define the action method onto.
 *
 * @param {String} key
 *        The action name.
 *
 * @param {Function} [fn]
 *        The action function to use. If none given, `target[key]` will be used.
 */
action.define = function define(target, key, fn=null) {
  if (!fn) {
    fn = target[key];
  }

  // Save the action method, and re-write it to be an action creator
  const descriptor = action(target, key, { value: fn });
  defineProperty(target, key, descriptor);
};

export default action;
