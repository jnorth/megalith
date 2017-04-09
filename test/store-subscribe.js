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

  app.subscribe(event => {
    t.is(event.store, app);
    t.is(event.action.type, '@init');
    t.is(event.action.payload.length, 0);
    t.is(event.after.version, 1);
  });
});

test('action triggers event', t => {
  const app = new App();

  app.subscribe(event => {
    if (event.action.type === '@init') return;
    t.is(event.action.type, 'bumpVersion');
    t.is(event.action.payload.length, 0);
    t.is(event.before.version, 1);
    t.is(event.after.version, 2);
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
