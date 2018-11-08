# Paper

**Paper is the core of the Psiagram framework**. It provides somewhere to input your settings, and an API to manipulate your Paper element once it's mounted in the DOM.

You can control the Paper using the following:

1. The **PaperProperties** passed into Paper during initialization
2. The **API** of the Paper object \(**methods** and **listeners**\)

This documentation will take a look into some of the basics of setting up and using Paper.

## Paper Set-Up

In order to use Paper, you need to initialize it. To do this, you will create a new instance of Paper and give it a Paper Properties object. This contains some mandatory properties, as well as many optional ones that allow elements and settings to be added to the Paper during initialization.

### Paper Properties

Here is the Paper Properties interface defined in TypeScript:

```typescript
interface IPaperProperties {
  width: number;
  height: number;
  plugins?: PsiagramPlugin[];
  attributes?: {
    gridSize?: number;
    paperWrapperClass?: string;
    paperClass?: string;
    uniqueId?: string;
  };
  initialConditions?: {
    nodes?: IPaperInputNode[];
    nodeComponentMap?: INodeComponentMap;
    edges?: IPaperInputEdge[];
    edgeComponentMap?: IEdgeComponentMap;
  };
}
```

This defines the shape of the object that must be given to initialize Paper. Let's take a look into what each of those potential properties mean.

#### width - `number`

This is the physical width of the Paper surface in pixels. It is one of the two required properties to initialize Paper.

#### height - `number`

This is the physical height of the Paper surface in pixels. Like width, it is required to initialize Paper.

#### plugins \(optional\) - `PsiagramPlugin[]`

An optional array of any initialized plugins you wish to pass into Paper. Plugins add functionality to Paper. This will be detailed further in the [plugins section](../plugins/). Plugins often have a significant impact on the functionality of Psiagram, and can be used to add sophisticated functionality to a diagram.

#### attributes \(optional\) - `Object`

An optional object where you can define attributes of the Paper. These are all **optional**, and are the following:

* gridSize - `number`: Grid size in px. If given, elements will snap to a grid.
* paperWrapperClass - `string`: Class for div that encompasses Paper.
* paperClass - `string`: Class for Paper SVG component.
* uniqueId - `string`: Unique ID for paper \(self-generated if none given\).

#### initialConditions \(optional\) - `Object`

An optional object where you can define any initial Nodes or Edges to render onto Paper when it's initialized. In order to input these, object has the following **optional** properties:

> Note: Psiagram only provides the base classes needed to begin building custom Nodes and Edges. Alone, the BaseNode class and Edge class will not render any visual components. You must extend these classes into your own [custom Nodes](../in-depth/custom-nodes.md) and [custom Edges](../in-depth/custom-edges.md).

* **nodes** - `IPaperInputNode[]`: Initial Node data needed to render out Nodes.

  More details on input Nodes can be found in the [Node section](node.md).

* **nodeComponentMap** - `INodeComponentMap`: Object to map component strings to an

  extended BaseNode class. Once you've built some Nodes, they can be included

  here and selected by giving the key string to the appropriate initial Nodes.

  ```typescript
  export interface INodeComponentMap {
    [key: string]: typeof BaseNode;
  }
  ```

* **edges** - `IPaperInputEdge[]`: Initial Edge data needed to render out Edges.

  More details on input Edges can be found in the [Edge section](edge.md).

* **edgeComponentMap** - `IEdgeComponentMap`: Object to map component strings to an

  extended Edge class. Once you've built some Edges, they can be included here

  and selected by giving the key string to the appropriate initial Edges.

  ```typescript
  export interface IEdgeComponentMap {
    [key: string]: typeof BaseEdge;
  }
  ```

### Initialization

Now that you have an idea of building a Paper Properties object, let's look at initializing a Paper instance.

```javascript
import { Paper, Rectangle, TextLine } from 'psiagram';
import { Grid } from 'psiagram-plugin-grid';
import { MouseEvents } from 'psiagram-plugin-mouse-events';
import { ManhattanRouting } from 'psiagram-plugin-routing';

const myPaper = new Paper({
  height: 900,
  width: 1300,
  attributes: {
    gridSize: 20,
    paperWrapperClass: 'myPaperWrapper',
    paperClass: 'myPaper',
    uniqueId: 'paper_unique_id',
  },
  plugins: [new Grid(), new MouseEvents(), new ManhattanRouting()],
  initialConditions: {
    nodes: [
      {
        id: 'node-1-id',
        component: 'rectangle',
        coords: { x: 80, y: 80 },
        properties: { title: 'Node 1', width: 120, height: 80 },
      },
    ],
    nodeComponentMap: { rectangle: Rectangle },
    edges: [
      {
        id: 'edge-1-id',
        component: 'text-edge',
        source: { id: 'node-1-id' },
        target: { x: 120, y: 240 },
        coords: [],
        properties: { title: 'Edge 1' },
      },
    ],
    edgeComponentMap: { 'text-edge': TextLine },
  },
});
```

Congratulations! You now have a fully functional Paper component initialized to myPaper. While you are able to call methods and make updates to this component, the actual paper element has not yet been rendered into the DOM, so those changes won't be reflected anywhere. In order to render the Paper, you may choose to do something like this:

```typescript
const paperElement = myPaper.getPaperElement();
document.getElementById('_target').appendChild(paperElement);
```

In the next section we will discuss manipulating the Paper using its methods.

## Paper Methods

Now that you have your Paper mounted in the DOM, you can manipulate it. While Psiagram would work just fine as a static diagram, it really shines in the many ways you can move or alter the elements drawn in Paper.

Let's examine some of the methods that you can call on your Paper instance.

### getPaperElement

```typescript
getPaperElement(): HTMLElement;
```

Returns the Paper wrapper, which contains the Paper SVG element, as well as all rendered components. This is the method you would call to retrieve the wrapper to render into your DOM. Here's an example of how to mount your paper.

```typescript
const paperElement = myPaper.getPaperElement();
const target = document.getElementById('_target');
target.appendChild(paperElement);
```

### addNode

```typescript
addNode(node: IPaperInputNode): void;
```

Add a Node to the Paper. While we touched on adding Nodes through Paper Properties when the Paper is initialized, you can also do it at any point using this method. This is also used internally by Paper for every initial Node provided. For more details on input Nodes, see the [Node section](node.md).

### getNode

```typescript
getNode(id: string): PaperNode;
```

Returns the Node instance that matches the given ID. The PaperNode that is returned exposes multiple properties that you can set to manipulate the Node's position, appearance, title, and more. These are detailed in the [Node section](node.md).

### removeNode

```typescript
removeNode(id: string): void;
```

Remove a Node from the Paper with the given ID.

### addEdge

```typescript
addEdge(edge: IPaperInputEdge): void;
```

Add an Edge to the Paper. Like addNode, this allows you to add Edges at any point after Paper has been initialized. This is also used internally within Paper for adding any initial Edges. For more information on input Edges, see the [Edge section](edge.md).

### getEdge

```typescript
getEdge(id: string): PaperEdge;
```

Returns the Edge instance that matches the given ID. The PaperEdge that is returned exposes multiple properties that you can set to manipulate the Edge's position, appearance, title, and more. These are detailed in the [Edge section](edge.md).

### removeEdge

```typescript
removeEdge(id: string): void;
```

Remove an Edge from the Paper that matches the given ID.

### getActiveItem

```typescript
getActiveItem(): IActiveItem | null;
```

Returns the current active item object, or null if there is no current active item. Active items allow specifying which component is currently moving or selected. For more information, see the [active item section](../in-depth/active-item.md).

### updateActiveItem

```typescript
updateActiveItem(activeItem?: IActiveItem): void;
```

Update the current active item, or remove it by calling the method without an argument. For more information, see the [active item section](../in-depth/active-item.md).

### addListener

```typescript
addListener(type: paperEventType, listener: (evt: PaperEvent) => void): void;
```

Add a listener for a specific event type. This listener will be called when the event is triggered within the Paper. For more details on types of events, or the PaperEvent object, visit the [events section](../in-depth/events.md).

### removeListener

```typescript
removeListener(type: paperEventType, listener: (evt: PaperEvent) => void): void;
```

Remove a previously added listener. For more details on types of events, or the PaperEvent object, visit the [events section](../in-depth/events.md).

