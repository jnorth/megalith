import buildActionPath from './buildActionPath';

const findRoot = (store) => {
  return store._parent
    ? findRoot(store._parent)
    : store;
};

/**
 * A decorator to mark store actions.
 */
export default function action(target, key, descriptor) {
  const reducer = descriptor.value;
  const reducerName = reducer.name;

  // Save current implementation as the reducer function
  Object.defineProperty(target, `@reducer_${reducerName}`, descriptor);

  // Write new implementation as the action creator function
  descriptor.value = function(...args) {
    findRoot(this).dispatch({
      path: buildActionPath(this),
      type: reducerName,
      payload: args,
    });
  };

  return descriptor;
};
