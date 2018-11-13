# Mouse Events Plugin

[![NPM Version](https://badge.fury.io/js/psiagram-plugin-mouse-events.svg)](https://www.npmjs.com/package/psiagram-plugin-mouse-events)

The Mouse Events Plugin provides on-click functionality to Psiagram. When you click a Node or Edge, the item becomes the active item, and you can drag it and interact with it on the Paper.

{% hint style="info" %}
Changes to add mouse events for Edges are currently inside of a [work-in-progress pull request on GitHub](https://github.com/liamross/psiagram/pull/89). Once the changes are complete, you will be able to add, move, and remove coordinates on an Edge.
{% endhint %}

## Mouse Events Set-Up

In order to use the Mouse Events Plugin, you need to initialize it. To do this, you will create a new instance of MouseEvents and add it to the `plugins` array when initializing Paper.

### Initialization

Let's look at initializing a Mouse Events instance.

```typescript
import { MouseEvents } from 'psiagram-plugin-mouse-events';

const myPaper = new Paper({
  height: 900,
  width: 1300,
  plugins: [new MouseEvents()],
});
```

