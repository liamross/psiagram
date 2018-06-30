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
  component: typeof Node;
  coords: ICoordinates;
  properties: {
    width: number;
    height: number;
    title?: string;
  };
}
```

This defines the shape of the object that must be given to Paper to create a
Node. Let's take a look into what each of those potential properties mean.

#### id - `string`

This is the unique ID of the Node. These **must** be unique amongst other Nodes
on the instance of Paper.

#### component - `typeof Node (not initialized)`

The component you pass in is an uninitialized Node class. This is so that it can
be initialized inside of Paper with any properties you pass in, as well as
properties specific to the Paper class. You may also pass in custom Node classes
here, which is detailed further in the
[custom nodes section](../in-depth/custom-nodes.md).

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

#### properties - `Object`

Properties is where you define any properties to pass into Node when it's
initialized. These are the default properties:

- width - `number`: Width of the Node.
- height - `string`: Height of the Node.
- title (optional) - `string`: Title to render onto Node.

By default, the base class Node will round width and height to `2 * gridSize`.
This is so that any Edges connected to the Node will be centered on the Node, as
they must have an endpoint on a grid intersect. If a title is given, it will be
centered on the Node element.

### Example

Here's an example of how to add a Node to the Paper using the Paper Input Node
object:

```ts
function addNode() {
  const node: IPaperInputNode = {
    id: 'new_node_test',
    component: Node,
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
