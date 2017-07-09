import test from 'ava';
import { Store, action, snapshot } from '..';

test('snapshot strings as state', t => {
  class A extends Store {
    initialState = 'test';

    @action bump() {
      return this.state + '!';
    }
  }

  const a = new A();
  t.is(snapshot.create(a), 'test');
  a.bump();
  t.is(snapshot.create(a), 'test!');

  snapshot.apply(a, 'abc123');
  t.is(a.state, 'abc123');
  t.is(snapshot.create(a), 'abc123');
  a.bump();
  t.is(snapshot.create(a), 'abc123!');
});

test('snapshot numbers as state', t => {
  class A extends Store {
    initialState = 100;

    @action bump() {
      return this.state + 1;
    }
  }

  const a = new A();
  t.is(snapshot.create(a), 100);
  a.bump();
  t.is(snapshot.create(a), 101);

  snapshot.apply(a, 500);
  t.is(a.state, 500);
  t.is(snapshot.create(a), 500);
  a.bump();
  t.is(snapshot.create(a), 501);
});

test('snapshot arrays as state', t => {
  class A extends Store {
    initialState = ['a', 'b', 'c'];

    @action bump() {
      return this.state.concat('d');
    }
  }

  const a = new A();
  t.deepEqual(snapshot.create(a), ['a', 'b', 'c']);
  a.bump();
  t.deepEqual(snapshot.create(a), ['a', 'b', 'c', 'd']);

  snapshot.apply(a, [1, 2, 3]);
  t.deepEqual(a.state, [1, 2, 3]);
  t.deepEqual(snapshot.create(a), [1, 2, 3]);
  a.bump();
  t.deepEqual(snapshot.create(a), [1, 2, 3, 'd']);
});

test('snapshot object as state', t => {
  class A extends Store {
    initialState = {
      counter: 0,
      a: {
        b: 'test',
      },
    };
  }

  const a = new A();

  t.deepEqual(snapshot.create(a), {
    counter: 0,
    a: {
      b: 'test',
    },
  });
});

test('custom snapshot serialization object', t => {
  class A extends Store {
    initialState = {
      counter: 0,
      test: 'test',
    };

    [snapshot.$serializer]() {
      return {
        counter: 1,
        test: { a: 'test' },
      };
    }
  }

  const a = new A();

  t.deepEqual(snapshot.create(a), {
    counter: 1,
    test: { a: 'test' },
  });
});

test('custom snapshot serialization basic', t => {
  class A extends Store {
    initialState = 'test';

    [snapshot.$serializer]() {
      return 'test!';
    }
  }

  const a = new A();
  t.is(snapshot.create(a), 'test!');
});

test('custom snapshot deserialization', t => {
  class A extends Store {
    initialState = {
      counter: 1,
      a: {
        b: 'test',
      }
    };

    [snapshot.$deserializer](state) {
      return {
        counter: 0,
        a: 'test',
      };
    }
  }

  const a = new A();
  snapshot.apply(a, {
    counter: 2,
    a: {
      b: 'test!',
    }
  });

  t.is(a.counter, 0);
  t.is(a.a, 'test');
  t.deepEqual(snapshot.create(a), {
    counter: 0,
    a: 'test',
  });
});

test('invalid snapshot deserialization', t => {
  class A extends Store {
    initialState = {
      a: 'a',
      b: 'b',
    };
  }

  const a = new A();
  t.is(a.a, 'a');
  t.is(a.b, 'b');
  snapshot.apply(a, { a:1, b:2 });
  t.is(a.a, 1);
  t.is(a.b, 2);

  const error = t.throws(() => {
    snapshot.apply(a, { a:1, b:2, x:3 });
  }, Error);

  t.true(error instanceof Error);
});

test('nested snapshot deserialization', t => {
  class B extends Store {
    initialState = {
      value: 1,
    };
  }

  class A extends Store {
    initialState = {
      value: 2,
      b: new B(),
    };
  }

  const a = new A();
  t.is(a.value, 2);
  t.is(a.b.value, 1);

  snapshot.apply(a, {
    value: 100,
    b: {
      value: 200,
    },
  });

  t.is(a.value, 100);
  t.is(a.b.value, 200);
});

test('serialize date', t => {
  class A extends Store {
    initialState = {
      date: new Date(),
    };

    [snapshot.$serializer]() {
      return {
        ...this.state,
        date: this.date.toJSON(),
      };
    }

    [snapshot.$deserializer](state) {
      return {
        ...state,
        date: new Date(state.date),
      };
    }
  }

  const a = new A();
  const s1 = snapshot.create(a);
  t.true(a.date instanceof Date);
  t.is(typeof s1.date, 'string');
  snapshot.apply(a, s1);
  t.true(a.date instanceof Date);
});
