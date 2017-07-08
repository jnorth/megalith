import isBasic from './isBasic';
import { $state, $children, $serializer, $deserializer } from './symbols';

/**
 * Creates a snapshot of a store's state tree, including all children stores.
 *
 * If a store implements a `[$serializer]` method, the return value of that
 * method will be used in place of the store's state.
 *
 * @param {Store} store
 * @returns {*}
 */
function create(store) {
  // Serialize own state
  const state = store[$serializer]
    ? store[$serializer]()
    : store[$state];

  if (isBasic(state)) {
    return state;
  }

  // Serialize children
  const children = Object.keys(store[$children]).reduce((combined, child) => {
    combined[child] = create(store[$children][child]);
    return combined;
  }, {});

  // Merge both together
  return {
    ...state,
    ...children,
  };
};

/**
 * Set a store's state, and the state of all children stores.
 *
 * If the store implements a `[$deserializer]` method, the return value of
 * that will be used for the replacement state.
 *
 * @param {Store} store
 * @param {*} state
 */
function apply(store, state) {
  if (store[$deserializer]) {
    state = store[$deserializer](state);
  }

  if (isBasic(state)) {
    store[$state] = state;
    return;
  }

  // Split child store state out from store's own state
  Object.keys(state).forEach(key => {
    // Own state
    if (store[$state][key] !== undefined) {
      store[$state][key] = state[key];
    }

    // Child state
    else if (store[$children][key] !== undefined) {
      apply(store[$children][key], state[key]);
    }

    // Unknown state
    else {
      throw Error(`Snapshot does not match shape of '${store.constructor.name}'.`);
    }
  });
};

export default {
  create,
  apply,
  $serializer,
  $deserializer,
};
