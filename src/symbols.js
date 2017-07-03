function createSymbol(name) {
  const key = `_megalith${name}`;
  return (typeof Symbol === 'function')
    ? Symbol.for(key)
    : key;
}

export const $state = createSymbol('State');
export const $name = createSymbol('Name');
export const $parent = createSymbol('Parent');
export const $children = createSymbol('Children');
export const $events = createSymbol('Events');
export const $reducers = createSymbol('Reducers');
