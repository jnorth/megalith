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
 * A decorator to mark store actions.
 */
export default function action(target, key, descriptor) {
  // Save current implementation as the reducer function
  target[$reducers] = target[$reducers] || {};
  Object.defineProperty(target[$reducers], key, descriptor);

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
