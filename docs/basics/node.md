# Node

Nodes are the building blocks of any diagram in Psiagram. At their most basic
they are rectangular SVG components rendered onto paper. Node classes provide
all of the rendering information such as appearance, title placement, etc.
However, there are various objects in the Psiagram ecosystem that contain the
Node name, and each pertains to a specific part of the Node lifecycle. Let's go
into more detail.

## Paper Input Node

This is the 'Node' that is input into Paper to create a Node. This can be given
in the `nodes` array in the `initialConditions` object when initializing Paper,
or in the `addNode` method call. See the [paper section](paper.md) for more on
the initialization details or method definitions.

### IPaperInputNode Specification

Here is the Paper Input Node interface defined in TypeScript:

```ts
interface IPaperInputNode {
  id: string;
  component: string;
  coords: ICoordinates;
  properties?: {
    [property: string]: any;
  };
}
```

This defines the shape of the object that must be given to Paper to create a
Node. Let's take a look into what each of those potential properties mean.

#### id - `string`

This is the unique ID of the Node. These **must** be unique amongst other Nodes
on the instance of Paper.

#### component - `string`

This string maps to a Node class within the `initialConditions.nodeComponentMap`
object that the Paper was initialized with. This allows you to map different
Nodes to different Node classes, allowing for Nodes with various colors, shapes
and sizes.

#### coords - `ICoordinates`

The coordinates at which the Node sits on Paper. The default behavior is that
Node will snap to the nearest grid if `gridSize` was provided to Paper.

- iCoordinates:

  ```ts
  interface ICoordinates {
    x: number;
    y: number;
  }
  ```

#### properties (optional) - `Object`

Properties is where you define any properties to pass into Node when it's
initialized. These will be entirely dependent on what properties your custom
Node accepts. For example, if your Node is a rectangle that displayes text, your
properties object may look like this:

```ts
const properties = {
  title: 'My Rectangle',
  width: 160,
  height: 80,
};
```

Whereas if it's a square perhaps you might have a slightly simpler set of
properties:

```ts
const properties = {
  title: 'My Square',
  length: 80,
};
```

For more information visit the
[custom Nodes section](../in-depth/custom-nodes.md).

### Example

Here's an example of how to add a Node to the Paper using the Paper Input Node
object:

```ts
function addNode() {
  const node: IPaperInputNode = {
    id: 'new_node_test',
    component: 'rectangle',
    coords: { x: 320, y: 160 },
    properties: { title: 'New Node', height: 80, width: 160 },
  };

  myPaper.addNode(node);
}
```

## Node Class

This is the class that defines the shape, color, and render details of a Node.
It is passed into Paper as the component property of Paper Input Node. Creating
Nodes with different shapes and colors requires extending the Node class.
Creating custom Nodes is detailed in the
[custom nodes section](../in-depth/custom-nodes.md). You will never interact
directly with a Node class, it is only passed in to the Paper. when you call the
`getNode` method, it actually returns an augmented version of the Node class
that will be discussed next.

## Paper Node

When Node classes are initialized within Paper, they have special proxy
properties added to them that simplify the process of changing the coordinates
of the Node. Without customization, a Node class exposes the get/set methods for
all properties passed in with the `properties` object detailed above. _Any
custom implementation of Node may take different properties, and thus may have
different get/set methods_. Paper adds get/set methods for coords to the Node,
thus returning a new object we call PaperNode.

We will run through some of the potential uses for PaperNode.

```ts
// Reminder: getNode(id: string): PaperNode

const yourNode = getNode('your-node-id');
```

Once you have your PaperNode, you can manipulate the properties directly.
Psiagram wraps all of the DOM manipulation logic inside of get/set methods, so
it's as simple as re-assigning the properties. Here's one example:

```ts
yourNode.width = 240;
yourNode.height = 100;
yourNode.title = 'New Title';
```

These properties will be updated automatically in the DOM. However, this ability
would have been available on the Node class, let's look at updating the
coordinates.

```ts
yourNode.coords = { x: yourNode.coords.x, y: 120 };
```

Here, we have kept the x-coordinate the same, but updated the y-coordinate
to 120. This will update in the DOM automatically, and will also fire a
`move-node` event. More detail on events can be found in the
[events section](../in-depth/events.md).

**Gotcha**: Because this uses getters and setters to wrap the DOM manipulation
logic, you must re-assign `yourNode.coords` entirely. You can't do something
like:

```ts
yourNode.coords.x = 50;
```

This just changes the x property of the object without actually calling the
setter. Therefore, none of the wrapped DOM manipulation logic will fire.
