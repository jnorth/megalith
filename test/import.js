import test from 'ava';
import megalith from '..';

class App extends megalith.Store {
  initialState = {
    version: 1,
  };

  @megalith.action bump() {
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
