import test from 'ava';
import { Store } from '..';

class App extends Store {
  initialState = {
    version: 1,
    a: {
      b: {
        c: 'nested',
      },
    },
    messages: ['A', 'B', 'C'],
  };
}

const app = new App();

test('set initial state', t => {
  t.is(app.state.version, 1);
  t.is(app.state.a.b.c, 'nested');
  t.is(app.state.messages[1], 'B');
});

test('set initial state serialization', t => {
  const state = app.serialize();

  t.is(state.version, 1);
  t.is(state.a.b.c, 'nested');
  t.is(state.messages[1], 'B');
});

test('disable resetting initial state', t => {
  const error = t.throws(() => {
    app.initialState = {};
  }, Error);

  t.true(error instanceof Error);
});

test('state is readonly', t => {
  const error = t.throws(() => {
    app.state = {};
  }, Error);

  t.true(error instanceof Error);
});

test('state getters', t => {
  t.is(app.version, 1);
  t.is(app.a.b.c, 'nested');
  t.is(app.messages[1], 'B');
});

test('state getters reference', t => {
  t.is(app.state.a.b.c, app.a.b.c);
  t.is(app.state.messages, app.messages);
});

test('state getters are readonly', t => {
  const error = t.throws(() => {
    app.version = 2;
  }, Error);

  t.true(error instanceof Error);
});

test('state property keys are enumerable', t => {
  const keys = Object.keys(app);

  t.is(keys.length, 3);
  t.not(keys.indexOf('version'), -1);
  t.not(keys.indexOf('a'), -1);
  t.not(keys.indexOf('messages'), -1);

  t.is(keys.indexOf('_flax'), -1);
  t.is(keys.indexOf('state'), -1);
  t.is(keys.indexOf('initialState'), -1);
});
