import { $parent, $reducers } from './symbols';
import buildActionPath from './buildActionPath';

const findRoot = (store) => {
  return store[$parent]
    ? findRoot(store[$parent])
    : store;
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
    const path = buildActionPath(this);
    const type = path.length
      ? `${path}.${key}`
      : key;
    findRoot(this).dispatch({ type, payload });
  };

  return descriptor;
};
