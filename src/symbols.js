function createSymbol(name) {
  return (typeof Symbol === 'function')
    ? Symbol.for(name)
    : `_${name}`;
}

export const $state = createSymbol('megalithState');
export const $name = createSymbol('megalithName');
export const $parent = createSymbol('megalithParent');
export const $children = createSymbol('megalithChildren');
export const $events = createSymbol('megalithEvents');
export const $reducers = createSymbol('megalithReducers');
