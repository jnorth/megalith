function createSymbol(name) {
  return (typeof Symbol === 'function')
    ? Symbol.for(name)
    : `_${name}`;
}

export const $state = createSymbol('flaxState');
export const $name = createSymbol('flaxName');
export const $parent = createSymbol('flaxParent');
export const $children = createSymbol('flaxChildren');
export const $subscribers = createSymbol('flaxSubscribers');
export const $reducers = createSymbol('flaxReducers');
