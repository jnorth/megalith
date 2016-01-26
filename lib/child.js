/**
 * A decorator to mark child stores.
 */
export default function child(child) {
  return (target, key, descriptor) => {
    return {
      get() {
        this._children.push(key);
        child._parent = this;
        child._pathName = key;

        Object.defineProperty(this, key, {
          configurable: true,
          writable: true,
          enumerable: true,
          value: child,
        });

        return child;
      }
    };
  };
};
