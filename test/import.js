import test from 'ava';
import flax from '..';

class App extends flax.Store {
  initialState = {
    version: 1,
  };

  @flax.action bump() {
    return {
      ...this.state,
      version: this.version + 1,
    };
  }
}

test('default export can be imported', t => {
  const app = new App();

  t.is(app.version, 1);
  app.bump();
  t.is(app.version, 2);
});
