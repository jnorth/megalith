# Asynchronous Actions

Often, you'll want to change application state based on network requests or
other asynchronous calls. Megalith requires action methods to be purely
synchronous however, so what do we do?

Easy, just pull your async code out into its own method and call your action
methods as it needs to.

In the example below, we want to fetch some posts from a server, showing a
loading indicator while it works. Our `fetchPosts` method sets the `loading`
flag, sends a request, calls `addPost` for each result, and finally unsets the
`loading` flag.

Since action methods are called just like regular methods, it's easy to mix and
match them to create natural feeling APIs.

```js
import { Store, action } from 'megalith';

class App extends Store {
  initialState: {
    loading: false,
    posts: [],
  };

  @action addPost(post) {
    return {
      ...this.state,
      posts: [...this.posts, posts],
    };
  }

  @action setLoadingState(loading) {
    return {
      ...this.state,
      loading,
    };
  }

  fetchPosts() {
    this.setLoadingState(true);

    return fetch('/posts')
      .then(posts => {
        posts.forEach(post => this.addPost(post));
      })
      .then(() => {
        this.setLoadingState(false);
      });
  }
}

const app = new App();

app.events.on({
  type: 'setLoadingState',
  handler: event => {
    myView.showLoadingIndicator(event.store.loading);
  },
});

app.fetchPosts().then(() => {
  myView.showPosts(app.posts);
});
```

<br><hr><h4>Documentation</h4>

  - [Quick Start](/docs/quick-start)
    - [Introduction](/docs/quick-start/1-introduction.md)
    - [State](/docs/quick-start/2-state.md)
    - [Actions](/docs/quick-start/3-actions.md)
    - [Events](/docs/quick-start/4-events.md)

  - [API Reference](/docs/api)
    - [Store](/docs/api/Store.md)
    - [action](/docs/api/action.md)
    - [events](/docs/api/events.md)
    - [snapshot](/docs/api/snapshot.md)

  - [Examples](/docs/examples)
    - Async Actions
    - [ES5 Syntax](/docs/examples/es5.md)
