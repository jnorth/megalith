import test from 'ava';
import { Store, action, child } from '..';

class Messages extends Store {
  initialState = {
    all: ['A', 'B', 'C'],
  };
}

class App extends Store {
  initialState = {
    version: 1,
    messages: new Messages(),
  };
}

test('store instance', t => {
  const app = new App();

  t.is(app.messages instanceof Store, true);
  t.is(app.messages instanceof Messages, true);
  t.is(app.messages.state.all.length, 3);
  t.is(app.messages.state.all[1], 'B');
});

test('serialize before accessing child', t => {
  const app = new App();
  const state = app.serialize();

  t.is(state.version, 1);
  t.is(state.messages.all.length, 3);
  t.is(state.messages.all[1], 'B');
});

test('children getters', t => {
  const app = new App();

  t.is(app.messages.all.length, 3);
  t.is(app.messages.all[1], 'B');
});
