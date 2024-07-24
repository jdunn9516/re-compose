
```
npm install recompose --save
```

## You can use Recompose to...

### ...lift state into functional wrappers

Helpers like `withState()` and `withReducer()` provide a nicer way to express state updates:

```js
const enhance = withState('counter', 'setCounter', 0)
const Counter = enhance(({ counter, setCounter }) =>
  <div>
    Count: {counter}
    <button onClick={() => setCounter(n => n + 1)}>Increment</button>
    <button onClick={() => setCounter(n => n - 1)}>Decrement</button>
  </div>
)
```

Or with a Redux-style reducer:

```js
const counterReducer = (count, action) => {
  switch (action.type) {
  case INCREMENT:
    return count + 1
  case DECREMENT:
    return count - 1
  default:
    return count
  }
}

const enhance = withReducer('counter', 'dispatch', counterReducer, 0)
const Counter = enhance(({ counter, dispatch }) =>
  <div>
    Count: {counter}
    <button onClick={() => dispatch({ type: INCREMENT })}>Increment</button>
    <button onClick={() => dispatch({ type: DECREMENT })}>Decrement</button>
  </div>
)
```

### ...perform the most common React patterns

Helpers like `componentFromProp()` and `withContext()` encapsulate common React patterns into a simple functional interface:

```js
const enhance = defaultProps({ component: 'button' })
const Button = enhance(componentFromProp('component'))

<Button /> // renders <button>
<Button component={Link} /> // renders <Link />
```

```js
const provide = store => withContext(
  { store: PropTypes.object },
  () => ({ store })
)

// Apply to base component
// Descendants of App have access to context.store
const AppWithContext = provide(store)(App)
```

### ...optimize rendering performance

No need to write a new class just to implement `shouldComponentUpdate()`. Recompose helpers like `pure()` and `onlyUpdateForKeys()` do this for you:

```js
// A component that is expensive to render
const ExpensiveComponent = ({ propA, propB }) => {...}

// Optimized version of same component, using shallow comparison of props
// Same effect as extending React.PureComponent
const OptimizedComponent = pure(ExpensiveComponent)

// Even more optimized: only updates if specific prop keys have changed
const HyperOptimizedComponent = onlyUpdateForKeys(['propA', 'propB'])(ExpensiveComponent)
```

### ...interoperate with other libraries

Recompose helpers integrate really nicely with external libraries like Relay, Redux, and RxJS

```js
const enhance = compose(
  // This is a Recompose-friendly version of Relay.createContainer(), provided by recompose-relay
  createContainer({
    fragments: {
      post: () => Relay.QL`
        fragment on Post {
          title,
          content
        }
      `
    }
  }),
  flattenProp('post')
)

const Post = enhance(({ title, content }) =>
  <article>
    <h1>{title}</h1>
    <div>{content}</div>
  </article>
)
```

### ...build your own libraries

Many React libraries end up implementing the same utilities over and over again, like `shallowEqual()` and `getDisplayName()`. Recompose provides these utilities for you.

```js
// Any Recompose module can be imported individually
import getDisplayName from 'recompose/getDisplayName'
ConnectedComponent.displayName = `connect(${getDisplayName(BaseComponent)})`

// Or, even better:
import wrapDisplayName from 'recompose/wrapDisplayName'
ConnectedComponent.displayName = wrapDisplayName(BaseComponent, 'connect')

import toClass from 'recompose/toClass'
// Converts a function component to a class component, e.g. so it can be given
// a ref. Returns class components as is.
const ClassComponent = toClass(FunctionComponent)
```

Forget ES6 classes vs. `createClass()`.

An idiomatic React application consists mostly of function components.

```js
const Greeting = props =>
  <p>
    Hello, {props.name}!
  </p>
```

## Usage

All functions are available on the top-level export.

```js
import { compose, mapProps, withState /* ... */ } from 'recompose'
```

**Note:** `react` is a _peer dependency_ of Recompose.  If you're using `preact`, add this to your `webpack.config.js`:

```js
resolve: {
  alias: {
    react: "preact"
  }
}
```

### Composition

Recompose helpers are designed to be composable:

```js
const BaseComponent = props => {...}

// This will work, but it's tedious
let EnhancedComponent = pure(BaseComponent)
EnhancedComponent = mapProps(/*...args*/)(EnhancedComponent)
EnhancedComponent = withState(/*...args*/)(EnhancedComponent)

// Do this instead
// Note that the order has reversed — props flow from top to bottom
const enhance = compose(
  withState(/*...args*/),
  mapProps(/*...args*/),
  pure
)
const EnhancedComponent = enhance(BaseComponent)
```

Technically, this also means you can use them as decorators (if that's your thing):

```js
@withState(/*...args*/)
@mapProps(/*...args*/)
@pure
class Component extends React.Component {...}
```

### Optimizing bundle size

Since `0.23.1` version recompose got support of ES2015 modules.
To reduce size all you need is to use bundler with tree shaking support
like [webpack 2](https://github.com/webpack/webpack) or [Rollup](https://github.com/rollup/rollup).

#### Using babel-plugin-lodash

[babel-plugin-lodash](https://github.com/lodash/babel-plugin-lodash) is not only limited to [lodash](https://github.com/lodash/lodash). It can be used with `recompose` as well.

This can be done by updating `lodash` config in `.babelrc`.

```diff
 {
-  "plugins": ["lodash"]
+  "plugins": [
+    ["lodash", { "id": ["lodash", "recompose"] }]
+  ]
 }
```

After that, you can do imports like below without actually including the entire library content.

```js
import { compose, mapProps, withState } from 'recompose'
```

### Debugging

It might be hard to trace how does `props` change between HOCs. A useful tip is you can create a debug HOC to print out the props it gets without modifying the base component. For example:

make

```js
const debug = withProps(console.log)
```

then use it between HOCs

```js
const enhance = compose(
  withState(/*...args*/),
  debug, // print out the props here
  mapProps(/*...args*/),
  pure
)
```

