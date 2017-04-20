import { $state, $name, $parent, $children } from './symbols';
import Store from './Store';

/**
 * Add a state property to a Store object.
 *
 * If the property is another Store object, it will be added as a
 * child Store. Otherwise, it is added to the target's state.
 *
 * @param {Store} target
 *        The target Store object to add the property to.
 *
 * @param {String} key
 *        The name of the property to add.
 *
 * @param {*} value
 *        The property value.
 */
function defineStateProperty(target, key, value) {
  // Track child stores
  if (value instanceof Store) {
    target[$children][key] = value;
    value[$parent] = target;
    value[$name] = key;

    Object.defineProperty(target, key, {
      enumerable: true,
      get() { return target[$children][key]; },
    });
  }

  // Copy local properties, and create getters
  else {
    target[$state][key] = value;

    Object.defineProperty(target, key, {
      enumerable: true,
      get() { return this[$state][key]; },
    });
  }
}

export default function defineStateProperties(target, state) {
  // Arrays, strings, numbers... should all be saved as-is
  const isBasic = (typeof state !== 'object' || Array.isArray(state));

  if (isBasic) {
    target[$state] = state;
    return;
  }

  // Otherwise, track each property of the passed-in object
  target[$state] = {};

  Object.keys(state).forEach(key => {
    defineStateProperty(target, key, state[key]);
  });
}
