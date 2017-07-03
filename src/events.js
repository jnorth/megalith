import { $events } from './symbols';

const defaultSubscriber = {
  tag: undefined,
  type: undefined,
  before: false,
  after: true,
  bubble: false,
  context: undefined,
};

function addSubscriber(store, subscriber) {
  // Assign default properties
  subscriber = Object.assign({}, defaultSubscriber, subscriber);

  // Register subscriber
  store[$events].push(subscriber);

  // Return subscriber--can be used to remove the subscriber later
  return subscriber;
}

function addAllSubscriber(store, handler) {
  // Add subscriber
  const subscriber = addSubscriber(store, {
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
}

function removeSubscriber(store, blueprint) {
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
}

function triggerSubscriberEvent(store, action, meta={}) {
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
}

function createEventsService(target) {
  return {
    on(...args) {
      return addSubscriber(target, ...args);
    },

    off(...args) {
      return removeSubscriber(target, ...args);
    },

    all(...args) {
      return addAllSubscriber(target, ...args);
    },

    trigger(...args) {
      return triggerSubscriberEvent(target, ...args);
    }
  };
}

export default {
  createService: createEventsService,
};
