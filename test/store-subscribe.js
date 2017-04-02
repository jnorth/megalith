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

test('init event', t => {
  const app = new App();

  app.subscribe(event => {
    t.is(event.store, app);
    t.is(event.action.type, '@init');
    t.is(event.action.path, '');
    t.is(event.action.payload.length, 0);
    t.is(event.after.version, 1);
  });
});

test('action triggers event', t => {
  const app = new App();

  app.subscribe(event => {
    if (event.action.type === '@init') return;
    t.is(event.action.type, 'bumpVersion');
    t.is(event.action.path, '');
    t.is(event.action.payload.length, 0);
    t.is(event.before.version, 1);
    t.is(event.after.version, 2);
    t.is(app.state.version, 2);
  });

  app.bumpVersion();
});
