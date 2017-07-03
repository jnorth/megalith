/**
 * Basic state objects are strings, numbers, or arrays. Objects are handled
 * as a special case, exposing accessors for each of the object's properties.
 *
 * @param {*} state
 *
 * @return {Boolean} True if the state object is a 'basic' object.
 */
export default function isBasic(state) {
  return (typeof state !== 'object' || Array.isArray(state));
}
