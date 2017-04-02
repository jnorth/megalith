import test from 'ava';
import { Store, action } from '..';

class App extends Store {
  initialState = {
    version: 1,
  };

  @action bumpVersion() {
    return {
      ...this.state,
      version: this.state.version + 1,
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
});

test('action replaces state reference', t => {
  const app = new App();
  const state = app.state;

  t.is(state === app.state, true);
  app.bumpVersion();
  t.is(state === app.state, false);
});
