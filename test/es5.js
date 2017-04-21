var test = require('ava');
var flax = require('..');

test('es5', t => {
  // Create constructor
  function App() {
    flax.Store.call(this);

    this.initialState = {
      version: 1,
      messages: ['a', 'b']
    };
  }

  // Extend Store
  App.prototype = Object.create(flax.Store.prototype);
  App.prototype.constructor = App;

  // Define action
  Object.defineProperty(App.prototype, 'bump', flax.action(App.prototype, 'bump', {
    value: function bump() {
      return Object.assign({}, this.state, {
        version: this.version + 1
      });
    },
  }));

  var app = new App();

  t.is(app.state.version, 1);
  t.deepEqual(app.state.messages, ['a', 'b']);
  t.is(app.version, 1);
  t.deepEqual(app.messages, ['a', 'b']);
  t.deepEqual(app.state, app.serialize());

  app.bump();
  t.is(app.state.version, 2);
  t.is(app.version, 2);
  t.is(app.serialize().version, 2);
});
