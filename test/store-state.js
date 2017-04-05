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

test('state', t => {
  t.is(app.state.version, 1);
  t.is(app.state.a.b.c, 'nested');
  t.is(app.state.messages[1], 'B');
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
