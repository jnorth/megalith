/**
 * Create an action path.
 */
export default function buildActionPath(store, path=[]) {
  path.push(store._pathName);

  return store._parent
    ? buildActionPath(store._parent, path)
    : path.reverse().filter(item => item).join('.');
};
