# Paper

**Paper is the core of the Psiagram framework**. It provides somewhere to input
your settings, and an API to manipulate your Paper element once it's mounted in
the DOM.

You can control the Paper using the following:

1.  The **PaperProperties** passed into Paper during initialization
1.  External **Plugins** that are passed into the Paper during initialization
1.  The **API** of the Paper object (**methods** and **listeners**)

This documentation will take a look into some of the basics of setting up and
using Paper.

## Paper Set-Up

In order to use Paper, you need to initialize it. To do this, you will create a
new instance of Paper and give it a Paper Properties object. This contains some
mandatory properties, as well as many optional ones that allow elements and
settings to be added to the Paper during initialization.

### Paper Properties

Here is the Paper Properties interface defined in TypeScript:

```ts
interface IPaperProperties {
  width: number;
  height: number;
  plugins?: PsiagramPlugin[];
  attributes?: {
    gridSize?: number;
    paperWrapperClass?: string;
    paperClass?: string;
  };
  initialConditions?: {
    nodes?: IPaperInputNode[];
    edges?: IPaperInputEdge[];
  };
}
```

This defines the shape of the object that must be given to initialize Paper.
Let's take a look into what each of those potential properties mean.

#### width - `number`

This is the physical width of the Paper surface in pixels. It is one of the two
required properties to initialize Paper.

#### height - `number`

This is the physical height of the Paper surface in pixels. Like width, it is
required to initialize Paper.

#### plugins (optional) - `PsiagramPlugin[]`

An optional array of any initialized plugins you wish to pass into Paper.
Plugins add functionality to Paper. This will be detailed further in the
[plugins section](../plugins/README.md).

#### attributes (optional) - `Object`

An optional object where you can define attributes of the Paper. These are all
**optional**, and are the following:

- gridSize - `number`: Grid size in px. If given, elements will snap to a grid.
- paperWrapperClass - `string`: Class for div that encompasses Paper.
- paperClass - `string`: Class for Paper SVG component.

#### initialConditions (optional) - `Object`

An optional object where you can define any initial Nodes or Edges to render
onto Paper when it's initialized. In order to input these, object has the
following **optional** properties:

- nodes - `IPaperInputNode[]`: Initial Nodes.
- edges - `IPaperInputEdge[]`: Initial Edges.

More details on input Nodes can be found in the [node section](node.md), and
information on input Edges can be found in the [edge section](edge.md).

### Initialization

Now that you have an idea of building a Paper Properties object, let's look at
initializing a Paper instance.

```js
import { Paper, Node, Edge } from 'psiagram';
import { Grid } from 'psiagram-plugin-grid';
import { MouseEvents } from 'psiagram-plugin-mouse-events';

const myPaper = new Paper({
  height: 900,
  width: 1300,
  attributes: {
    gridSize: 20,
    paperWrapperClass: 'myPaperWrapper',
    paperClass: 'myPaper',
  },
  plugins: [new Grid(), new MouseEvents()],
  initialConditions: {
    nodes: [
      {
        id: 'node-1-id',
        component: Node,
        coords: { x: 80, y: 80 },
        properties: { title: 'Node 1', width: 120, height: 80 },
      },
    ],
    edges: [
      {
        id: 'edge-1-id',
        component: Edge,
        source: { id: 'node-1-id' },
        target: { x: 120, y: 240 },
        coords: [],
        properties: { title: 'Edge 1' },
      },
    ],
  },
});
```

Congratulations! You now have a fully functional Paper component initialized to
myPaper. While you are able to call methods and make updates to this component,
the actual paper element has not yet been rendered into the DOM, so those
changes won't be reflected anywhere. In order to render the Paper, you may
choose to do something like this:

```ts
const paperElement = myPaper.getPaperElement();
document.getElementById('_target').appendChild(paperElement);
```

In the next section we will discuss manipulating the Paper using its methods.

## Paper Methods

Now that you have your Paper mounted in the DOM, you can manipulate it. While
Psiagram would work just fine as a static diagram, it really shines in the many
ways you can move or alter the elements drawn in Paper.

Let's examine some of the methods that you can call on your Paper instance.

### getPaperElement

```ts
getPaperElement(): HTMLElement;
```

Returns the Paper wrapper, which contains the Paper SVG element, as well as all
rendered components. This is the method you would call to retrieve the wrapper
to render into your DOM.

### addNode

```ts
addNode(node: IPaperInputNode): void;
```

Add a Node to the Paper. While we touched on adding Nodes through Paper
Properties when the Paper is initialized, you can also do it at any point using
this method. for more details on input Nodes, see the [node section](node.md).

### getNode

```ts
getNode(id: string): PaperNode;
```

Returns the Node instance that matches the given id. The PaperNode that is
returned exposes multiple properties that you can set to manipulate the Node's
position, appearance, title, and more. These are detailed in the
[node section](node.md).

### removeNode

```ts
removeNode(id: string): void;
```

Remove a Node from the Paper that matches the given id.

### addEdge

```ts
addEdge(edge: IPaperInputEdge): void;
```

Add an Edge to the Paper. Similarly to addNode, this allows you to add Edges
after Paper has been initialized. For more information on input Edges, see the
[edge section](edge.md).

### getEdge

```ts
getEdge(id: string): PaperEdge;
```

Returns the Edge instance that matches the given id. The PaperEdge that is
returned exposes multiple properties that you can set to manipulate the Edge's
position, appearance, title, and more. These are detailed in the
[edge section](edge.md).

### removeEdge

```ts
removeEdge(id: string): void;
```

Remove a Edge from the Paper that matches the given id.

### getActiveItem

```ts
getActiveItem(): IActiveItem | null;
```

Returns the current active item object, or null if there is no current active
item. Active items allow specifying which component is currently moving or
selected. For more information, see the
[active item section](../in-depth/active-item.md).

### updateActiveItem

```ts
updateActiveItem(activeItem?: IActiveItem): void;
```

Update the current active item, or remove it by calling the method without an
argument. For more information, see the
[active item section](../in-depth/active-item.md).

### addListener

```ts
addListener(type: paperEventType, listener: (evt: PaperEvent) => void): void;
```

Add a listener for a specific event type. This listener will be called when the
event is triggered within the paper. For more details on types of events, or the
PaperEvent object, visit the [events section](../in-depth/events.md).

### removeListener

```ts
removeListener(type: paperEventType, listener: (evt: PaperEvent) => void): void;
```

Remove a previously added listener. For more details on types of events, or the
PaperEvent object, visit the [events section](../in-depth/events.md).
