# Routing Plugin

[![NPM Version](https://badge.fury.io/js/psiagram-plugin-routing.svg)](https://www.npmjs.com/package/psiagram-plugin-routing)

The Routing Plugin provides solutions for enhancing the routing of your Edges as they connect Nodes or points.

## Manhattan Routing

Manhattan Routing causes Edges to connect Nodes using only 90 degree angles, and some basic rules around how to connect them. This can improve the appearance of workflow-style diagrams, where the straight-line connections may appear cluttered.

### ManhattanRouting Properties

Here is the Manhattan Routing Properties interface defined in TypeScript:

```typescript
export interface IManhattanRoutingProperties {
	minimumEdgeExtension?: number;
}
```

This defines the shape of the object that must be given to initialize Manhattan Routing. Let's take a look into what each of those potential properties mean.

#### minimumEdgeExtension \(optional\) - `number`

This is the minimum amount that the Edge will extend out of any Nodes before it takes a 90 degree turn. This avoids the Edge turning instantly out of the Node, causing it to appear to come from the corner. **The default is 20**.

### Initialization

Now that you have an idea of building a Manhattan Routing Properties object, let's look at initializing a Manhattan Routing instance.

```typescript
import {ManhattanRouting} from 'psiagram-plugin-routing';

const myPaper = new Paper({
	height: 900,
	width: 1300,
	plugins: [new ManhattanRouting({minimumEdgeExtension: 40})],
});
```

Keep in mind you can simply initialize it with nothing to get the default values.

```typescript
import {ManhattanRouting} from 'psiagram-plugin-routing';

const myPaper = new Paper({
	height: 900,
	width: 1300,
	plugins: [new ManhattanRouting()],
});
```
