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
  t.plan(6);

  function handler(event) {
    t.is(event.store, app);
    t.is(event.action.type, '@init');
    t.is(event.action.payload.length, 0);
  }

  app.subscribe(event => handler(event));

  app.subscribe.on({
    init: true,
    handler,
  });

  app.subscribe.on({
    handler,
  });
});

test('action triggers event', t => {
  const app = new App();
  t.plan(3);

  app.subscribe(event => {
    if (event.action.type === '@init') return;
    t.is(event.action.type, 'bumpVersion');
    t.is(event.action.payload.length, 0);
    t.is(app.state.version, 2);
  });

  app.bumpVersion();
});

test('action triggers child event', t => {
  const app = new App();

  app.subscribe(event => {
    if (event.action.type === '@init') return;
    if (event.action.type === 'bumpVersion') return;
    t.is(event.action.type, 'messages.add');
    t.is(event.action.payload.length, 1);
    t.is(event.action.payload[0], 'C');
  });

  app.messages.subscribe(event => {
    if (event.action.type === '@init') return;
    t.is(event.action.type, 'add');
    t.is(event.action.payload.length, 1);
    t.is(event.action.payload[0], 'C');
  });

  app.messages.add('C');
  app.bumpVersion();

  const app2 = new App();

  app2.subscribe(event => {
    if (event.action.type === '@init') return;
    t.is(event.action.type, 'messages.a.increment');
    t.is(event.action.payload.length, 0);
  });

  app2.messages.a.increment();
});

test('subscribe service cache', t => {
  const app = new App();

  t.is(app.subscribe, app.subscribe);
});

test('subscribe service clobber', t => {
  class A extends Store {
    @action a() { return {}; }
  }

  class B extends Store {
    @action b() { return {}; }
  }

  const a = new A();
  const b = new B();

  t.not(a.subscribe, b.subscribe);

  a.subscribe.on({
    handler: event => t.is(event.action.type, 'a'),
  });

  b.subscribe.on({
    handler: event => t.is(event.action.type, 'b'),
  });

  a.a();
  b.b();
});

test('subscribe on', t => {
  class A extends Store {
    @action a() { return {}; }
    @action b() { return {}; }
    @action c() { return {}; }
  }

  t.plan(6);
  const app = new A();

  app.subscribe.on({
    handler: event => t.not(['a', 'b', 'c'].indexOf(event.action.type), -1),
  });

  app.subscribe.on({
    type: 'a',
    handler: event => t.is(event.action.type, 'a'),
  });

  app.subscribe.on({
    type: 'b',
    handler: event => t.is(event.action.type, 'b'),
  });

  app.subscribe.on({
    type: 'c',
    handler: event => t.is(event.action.type, 'c'),
  });

  app.a();
  app.b();
  app.c();
});

test('subscribe off', t => {
  const app = new App();
  t.plan(1);

  const handler = event => t.is(event.action.type, 'bumpVersion');
  app.subscribe.on(handler);

  app.bumpVersion();
  app.subscribe.off(handler);
  app.bumpVersion();
});

test('subscribe off ref', t => {
  const app = new App();
  t.plan(2);

  const handler = event => t.is(event.action.type, 'bumpVersion');
  const ref = app.subscribe.on(handler);
  t.is(ref.handler, handler);

  app.bumpVersion();
  app.subscribe.off(ref);
  app.bumpVersion();
});

test('subscribe off tag', t => {
  const app = new App();
  t.plan(2);

  const handler = event => t.is(event.action.type, 'bumpVersion');
  app.subscribe.on({ tag: 'aaa', handler });

  app.bumpVersion();
  app.subscribe.off({ tag: 'bbb' });
  app.bumpVersion();
  app.subscribe.off({ tag: 'aaa' });
  app.bumpVersion();
});

test('subscribe context', t => {
  const app = new App();

  app.subscribe.on({
    context: 123,
    handler: event => t.is(event.context, 123),
  });

  const ref = { a: 'a' };

  app.subscribe.on({
    context: ref,
    handler: event => t.is(event.context, ref),
  });

  app.bumpVersion();
});

test('subscribe before and after', t => {
  const app = new App();
  t.plan(2);

  app.subscribe.on({
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

test('subscribe bubble', t => {
  const app = new App();
  t.plan(3);

  app.subscribe.on({
    bubble: true,
    handler: event => t.is(event.action.type, 'messages.a.increment'),
  });

  app.messages.subscribe.on({
    bubble: true,
    handler: event => t.is(event.action.type, 'a.increment'),
  });

  app.messages.a.subscribe.on({
    bubble: true,
    handler: event => t.is(event.action.type, 'increment'),
  });

  app.subscribe.on({
    bubble: false,
    handler: event => t.is(event.action.type, 'XYZ'),
  });

  app.messages.subscribe.on({
    bubble: false,
    handler: event => t.is(event.action.type, 'XYZ'),
  });

  app.messages.a.increment();
});
