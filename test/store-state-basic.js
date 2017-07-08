import test from 'ava';
import { Store, action } from '..';

test('strings as state', t => {
  class A extends Store {
    initialState = 'test';

    @action bump() {
      return this.state + '!';
    }
  }

  const a = new A();
  t.is(a.state, 'test');
  a.bump();
  t.is(a.state, 'test!');
});

test('numbers as state', t => {
  class A extends Store {
    initialState = 100;

    @action bump() {
      return this.state + 1;
    }
  }

  const a = new A();
  t.is(a.state, 100);
  a.bump();
  t.is(a.state, 101);
});

test('arrays as state', t => {
  class A extends Store {
    initialState = ['a', 'b', 'c'];

    @action bump() {
      return this.state.concat('d');
    }
  }

  const a = new A();
  t.deepEqual(a.state, ['a', 'b', 'c']);
  a.bump();
  t.deepEqual(a.state, ['a', 'b', 'c', 'd']);
});
