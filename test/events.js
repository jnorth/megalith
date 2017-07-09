import test from 'ava';
import { Store, action } from '..';

class A extends Store {
  initialState = {
    value: 1,
  };

  @action increment() {
    return {
      ...this.state,
      value: this.value + 1,
    };
  }
}

class Messages extends Store {
  initialState = {
    all: ['A', 'B'],
    a: new A(),
  };

  @action add(message) {
    return {
      ...this.state,
      all: this.all.concat(message),
    };
  }
}

class App extends Store {
  initialState = {
    version: 1,
    messages: new Messages(),
  };

  @action bumpVersion() {
    return {
      ...this.state,
      version: this.state.version + 1,
    };
  }
}

test('init event', t => {
  const app = new App();
  t.plan(3);

  app.events.all(event => {
    t.is(event.store, app);
    t.is(event.action.type, '@init');
    t.is(event.action.payload.length, 0);
  });
});

test('action triggers event', t => {
  const app = new App();
  t.plan(3);

  app.events.on({
    handler: event => {
      t.is(event.action.type, 'bumpVersion');
      t.is(event.action.payload.length, 0);
      t.is(app.state.version, 2);
    }
  });

  app.bumpVersion();
});

test('action triggers child event', t => {
  const app = new App();

  app.events.on({
    handler: event => {
      if (event.action.type === 'bumpVersion') return;
      t.is(event.action.type, 'messages.add');
      t.is(event.action.payload.length, 1);
      t.is(event.action.payload[0], 'C');
    }
  });

  app.messages.events.on({
    handler: event => {
      t.is(event.action.type, 'add');
      t.is(event.action.payload.length, 1);
      t.is(event.action.payload[0], 'C');
    }
  });

  app.messages.add('C');
  app.bumpVersion();

  const app2 = new App();

  app2.events.on({
    handler: event => {
      t.is(event.action.type, 'messages.a.increment');
      t.is(event.action.payload.length, 0);
    }
  });

  app2.messages.a.increment();
});

test('events service clobber', t => {
  class A extends Store {
    @action a() { return {}; }
  }

  class B extends Store {
    @action b() { return {}; }
  }

  const a = new A();
  const b = new B();

  t.plan(3);
  t.not(a.events, b.events);

  a.events.on({
    handler: event => t.is(event.action.type, 'a'),
  });

  b.events.on({
    handler: event => t.is(event.action.type, 'b'),
  });

  a.a();
  b.b();
});

test('events on', t => {
  class A extends Store {
    @action a() { return {}; }
    @action b() { return {}; }
    @action c() { return {}; }
  }

  t.plan(6);
  const app = new A();

  app.events.on({
    handler: event => t.not(['a', 'b', 'c'].indexOf(event.action.type), -1),
  });

  app.events.on({
    type: 'a',
    handler: event => t.is(event.action.type, 'a'),
  });

  app.events.on({
    type: 'b',
    handler: event => t.is(event.action.type, 'b'),
  });

  app.events.on({
    type: 'c',
    handler: event => t.is(event.action.type, 'c'),
  });

  app.a();
  app.b();
  app.c();
});

test('events off', t => {
  const app = new App();
  t.plan(1);

  const handler = event => t.is(event.action.type, 'bumpVersion');
  app.events.on({ handler });

  app.bumpVersion();
  app.events.off({ handler });
  app.bumpVersion();
});

test('events off ref', t => {
  const app = new App();
  t.plan(2);

  const handler = event => t.is(event.action.type, 'bumpVersion');
  const ref = app.events.on({ handler });
  t.is(ref.handler, handler);

  app.bumpVersion();
  app.events.off(ref);
  app.bumpVersion();
});

test('events off tag', t => {
  const app = new App();
  t.plan(2);

  const handler = event => t.is(event.action.type, 'bumpVersion');
  app.events.on({ tag: 'aaa', handler });

  app.bumpVersion();
  app.events.off({ tag: 'bbb' });
  app.bumpVersion();
  app.events.off({ tag: 'aaa' });
  app.bumpVersion();
});

test('events context', t => {
  const app = new App();

  app.events.on({
    context: 123,
    handler: event => t.is(event.context, 123),
  });

  const ref = { a: 'a' };

  app.events.on({
    context: ref,
    handler: event => t.is(event.context, ref),
  });

  app.bumpVersion();
});

test('events before and after', t => {
  const app = new App();
  t.plan(2);

  app.events.on({
    type: 'bumpVersion',
    before: true,
    after: true,
    context: { value: 0 },
    handler: event => {
      event.context.value += 1;
      t.is(event.store.version, event.context.value);
    },
  });

  app.bumpVersion();
});

test('events bubble', t => {
  const app = new App();
  t.plan(3);

  app.events.on({
    bubble: true,
    handler: event => t.is(event.action.type, 'messages.a.increment'),
  });

  app.messages.events.on({
    bubble: true,
    handler: event => t.is(event.action.type, 'a.increment'),
  });

  app.messages.a.events.on({
    bubble: true,
    handler: event => t.is(event.action.type, 'increment'),
  });

  app.events.on({
    bubble: false,
    handler: event => t.is(event.action.type, 'XYZ'),
  });

  app.messages.events.on({
    bubble: false,
    handler: event => t.is(event.action.type, 'XYZ'),
  });

  app.messages.a.increment();
});

test('events off length', t => {
  const app = new App();

  app.events.on({ tag: 'a', handler: event => {}});
  app.events.on({ tag: 'b', handler: event => {}});
  app.events.on({ tag: 'b', handler: event => {}});
  app.events.on({ tag: 'c', handler: event => {}});

  t.is(app.events.off({ tag: 'a' }), 1);
  t.is(app.events.off({ tag: 'x' }), 0);
  t.is(app.events.off({ tag: 'b' }), 2);
  t.is(app.events.off({ tag: 'c' }), 1);
});
