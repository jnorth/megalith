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
  descriptor.value = function(...args) {
    findRoot(this).dispatch({
      path: buildActionPath(this),
      type: key,
      payload: args,
    });
  };

  return descriptor;
};
