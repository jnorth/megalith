/**
 * Create an action path.
 */
export default function buildActionPath(store, path=[]) {
  path.push(store._flax.pathName);

  return store._flax.parent
    ? buildActionPath(store._flax.parent, path)
    : path.reverse().filter(item => item).join('.');
};
