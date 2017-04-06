import test from 'ava';
import { Store, action } from '..';

class Messages extends Store {
  initialState = {
    all: [],
  };

  @action add(message) {
    return {
      ...this.state,
      all: this.all.concat(message),
    };
  }

  // Test naming conflicts with child stores
  @action bumpVersion() {
    return {
      ...this.state,
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

  @action revertVersion() {
    return {
      ...this.state,
      version: this.version - 1,
    };
  }

  // Test naming conflicts with child stores
  @action add() {
    return {
      ...this.state,
    };
  }
}

test('action updates simple state property', t => {
  const app = new App();

  t.is(app.state.version, 1);
  app.bumpVersion();
  t.is(app.state.version, 2);
  app.bumpVersion();
  t.is(app.state.version, 3);
  app.revertVersion();
  t.is(app.state.version, 2);
});

test('action replaces state reference', t => {
  const app = new App();
  const state = app.state;

  t.is(state === app.state, true);
  app.bumpVersion();
  t.is(state === app.state, false);
});

test('nested actions', t => {
  const app = new App();

  t.is(app.messages.all.length, 0);
  app.messages.add('A');
  t.is(app.messages.all.length, 1);
  t.is(app.messages.all[0], 'A');
  app.messages.add('B');
  t.is(app.messages.all.length, 2);
  t.is(app.messages.all[1], 'B');
});
