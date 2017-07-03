import { $events } from './symbols';

const defaultSubscriber = {
  tag: undefined,
  type: undefined,
  before: false,
  after: true,
  bubble: false,
  context: undefined,
};

/**
 * Create an event service for a specific store.
 *
 * This is purely to allow name-spacing the event functions behind
 * `store.events`.
 *
 * @param {Store} store
 */
function createService(store) {
  return {

    /**
     * Subscribe to a store's events.
     * @param {*} subscriber
     * @return {*} A subscription reference. Can be used in `events.off`.
     */
    on(subscriber) {
      // Assign default properties
      subscriber = Object.assign({}, defaultSubscriber, subscriber);

      // Register subscriber
      store[$events].push(subscriber);

      // Return subscriber--can be used to remove the subscriber later
      return subscriber;
    },

    /**
     * Unsubscribe from a store's events.
     * @param {*} blueprint
     * @return {Number} The number of event subscriptions removed.
     */
    off(blueprint) {
      const properties = Object.keys(blueprint);
      const length = store[$events].length;

      store[$events] = store[$events].filter(subscriber => {
        // Fast path -- equality test
        if (subscriber === blueprint) return false;

        // Regular path -- all blueprint properties need to match the subscriber
        return properties.reduce((keep, property) => {
          if (keep === false) return false;
          return blueprint[property] !== subscriber[property];
        }, true);
      });

      return length - store[$events].length;
    },

    /**
     * Subscribe to all store events. Immediately triggers a special `@init`
     * event.
     * @param {*} handler
     * @return {*} A subscription reference. Can be used in `events.off`.
     */
    all(handler) {
      // Add subscriber
      const subscriber = this.on({
        handler,
        bubble: true,
      });

      // Trigger init event
      subscriber.handler({
        store,
        action: {
          type: '@init',
          payload: [],
        },
      });

      return subscriber;
    },

    /**
     * Trigger an event.
     * @private
     * @param {*} action
     * @param {*} meta
     */
    trigger(action, meta={}) {
      store[$events].forEach(subscriber => {
        // Skip non-matching types
        if (subscriber.type && subscriber.type !== action.type) return;

        // Skip events not targeted to our specific store
        if (!subscriber.bubble && meta.isChild) return;

        // Fire events
        const event = { store, action, context: subscriber.context };
        if (subscriber.before && meta.before) subscriber.handler(event);
        if (subscriber.after && meta.after) subscriber.handler(event);
      });
    },

  };
}

export default {
  createService,
};
