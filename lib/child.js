/**
 * A decorator to mark child stores.
 */
export default function child(child) {
  return (target, key, descriptor) => {
    return {
      get() {
        this._flax.children.push(key);
        child._flax.parent = this;
        child._flax.pathName = key;

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
