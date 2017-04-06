import { $name, $parent } from './symbols';

/**
 * Create an action path.
 */
export default function buildActionPath(store, path=[]) {
  path.push(store[$name]);

  return store[$parent]
    ? buildActionPath(store[$parent], path)
    : path.reverse().filter(item => item).join('.');
};
