var test = require('ava');
var megalith = require('..');

test('es5', t => {
  // Create constructor
  function App() {
    megalith.Store.call(this);

    this.initialState = {
      version: 1,
      messages: ['a', 'b']
    };
  }

  // Extend Store
  App.prototype = Object.create(megalith.Store.prototype);
  App.prototype.constructor = App;

  // Define actions

  megalith.action.define(App.prototype, 'bump', function() {
    return Object.assign({}, this.state, {
      version: this.version + 1,
    });
  });

  App.prototype.addMessage = function addMessage(message) {
    return Object.assign({}, this.state, {
      messages: this.messages.concat(message),
    });
  };

  megalith.action.define(App.prototype, 'addMessage');

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

  app.addMessage('c');
  t.is(app.state.version, 2);
  t.is(app.version, 2);
  t.deepEqual(app.state.messages, ['a', 'b', 'c']);
  t.deepEqual(app.messages, ['a', 'b', 'c']);
  t.deepEqual(app.serialize().messages, ['a', 'b', 'c']);
});
