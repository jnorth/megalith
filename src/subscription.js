import { $subscribers } from './symbols';

const defaultSubscriber = {
  tag: undefined,
  type: undefined,
  init: false,
  before: false,
  after: true,
  bubble: true,
  context: undefined,
};

function addSubscriber(store, subscriber) {
  // Convert bare functions into subscriber objects
  if (typeof subscriber === 'function') {
    subscriber = { handler: subscriber };
  }

  // Assign default properties
  subscriber = Object.assign({}, defaultSubscriber, subscriber);

  // Register subscriber
  store[$subscribers].push(subscriber);

  // Trigger init event
  if (subscriber.init) {
    subscriber.handler({
      store,
      action: {
        type: '@init',
        payload: [],
      },
    });
  }

  return subscriber;
}

function removeSubscriber(store, blueprint) {
  const isFunction = (typeof blueprint === 'function');
  const properties = isFunction
    ? []
    : Object.keys(blueprint);

  store[$subscribers] = store[$subscribers].filter(subscriber => {
    // Fast path -- equality test
    if (subscriber === blueprint) return false;

    // Fast path -- blueprint is a handler function
    if (isFunction && blueprint === subscriber.handler) return false;

    // Regular path -- all blueprint properties need to match the subscriber
    return properties.reduce((keep, property) => {
      if (keep === false) return false;
      return blueprint[property] !== subscriber[property];
    }, true);
  });
}

function triggerSubscriberEvent(store, action, meta={}) {
  store[$subscribers].forEach(subscriber => {
    const event = { store, action, context: subscriber.context };

    // Skip non-matching types
    if (subscriber.type && subscriber.type !== action.type) return;

    // Skip events not targeted to our specific store
    if (!subscriber.bubble && meta.isChild) return;

    // Fire events
    if (subscriber.before && meta.before) subscriber.handler(event);
    if (subscriber.after && meta.after) subscriber.handler(event);
  });
}

function createSubscriptionService(target) {
  const service = handler => addSubscriber(target, { init: true, handler });
  service.on = (...args) => addSubscriber(target, ...args);
  service.off = (...args) => removeSubscriber(target, ...args);
  service.trigger = (...args) => triggerSubscriberEvent(target, ...args);
  return service;
}

export default {
  createService: createSubscriptionService,
};
