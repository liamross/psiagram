# Paper

**Paper** is the core of the Psiagram framework. It provides somewhere to input
your settings, and an API to manipulate your Paper element once it's mounted in
the DOM.

You can control the Paper using the following:

1.  The **PaperProperties** passed into Paper during initialization
1.  External **Plugins** that are passed into the Paper during initialization
1.  The **API** of the Paper object (**methods** and **listeners**)

This documentation will take a look into some of the basics of setting up and
using Paper.

## Initialization

In order to use Paper, you need to initialize it. Initializing Paper has some
required properties, as well as many optional ones. If you wanted to initialize
Paper with only required properties, it would look like this:

```js
import { Paper } from 'psiagram';

const myPaper = new Paper({ height: 900, width: 1300 });
```

This is technically all you need in order to initialize Paper! This will create
an instance of Paper that is 1300px by 900px.

However, for this example, let's include more things and mount it in the DOM:

```js
import { Paper, Node, Edge } from 'psiagram';
import { MouseEvents } from 'psiagram-plugin-mouse-events';

const initializedMouseEvents = new MouseEvents();

const myPaper = new Paper({
  height: 900,
  width: 1300,
  // Attributes is an optional object that allows you to pass some additional
  // attributes to the Paper.
  attributes: { gridSize: 20, paperClass: 'myPaper' },
  // Plugins is an optional array of plugins. These add functionality to the
  // instance of Paper.
  plugins: [initializedMouseEvents],
  // Initial Conditions is an optional object that can contain any Nodes or
  // Edges to draw on the Paper when it is mounted.
  initialConditions: {
    nodes: [
      {
        id: 'node-1-id',
        component: Node,
        coords: { x: 80, y: 80 },
        properties: { title: 'Node 1', width: 120, height: 80 },
      },
      {
        id: 'node-2-id',
        component: Node,
        coords: { x: 240, y: 80 },
        properties: { title: 'Node 2', width: 120, height: 80 },
      },
    ],
    edges: [
      {
        id: 'edge-1-id',
        component: Edge,
        source: { id: 'node-1-id' },
        target: { id: 'node-2-id' },
        coords: [],
        properties: { title: 'Edge 1' },
      },
    ],
  },
});

const paperElement = myPaper.getPaperElement();
document.getElementById('_target').appendChild(paperElement);
```

Here's what that gives you:

1.  An instance of Paper that is 1300px by 900px
1.  A 20px grid for elements inside of Paper to snap to
1.  Selection and drag-n-drop capabilities thanks to the MouseEvents plugin
1.  Two initial Nodes mounted on to the paper
1.  An initial Edge mounted on to the paper
1.  The Paper element which is linked to myPaper mounted in the DOM

> 🚧 Full API and Plugin documentation is coming! 🚧
>
> This will include the specification of IPaperProperties for a more complete
> list of properties you can initialize Paper with, as well as a link to
> MouseEvents plugin for more details on what it can do.

<!-- TODO: Add link to IPaperProperties and MouseEvents -->

In the next section we will discuss manipulating the Paper, as well as touching
on the Nodes and Edges we introduced in the example above.

## Manipulation

Now that you have your Paper mounted in the DOM, it's time to manipulate it.
While Psiagram would work just fine as a static diagram, it really shines in the
many ways you can move or alter the elements drawn in Paper.

### Nodes

Nodes are blocks that can be placed on the Paper. At their most basic, Nodes are
rectangles that have some properties and a position.

Let's try adding a Node using the API:

```js
myPaper.addNode({
  id: 'example-node-id',
  component: Node,
  coords: { x: 320, y: 160 },
  properties: { title: 'Example Node', height: 80, width: 160 },
});
```

You now have a Node placed onto the Paper at coordinates `{ x: 320, y: 160 }`.

That was pretty straightforward! Now what about if you want to move that Node to
a new position? Since you added MouseEvents before, you could just click and
drag the Node in your DOM to move it to a new position on the Paper. However,
let's say you wanted to do it automatically because you're running a script to
organize the Nodes on the Paper.

To move a Node using the API:

```js
myPaper.moveNode('example-node', { x: 120, y: 160 });
```

You've now changed the position of the Node on Paper by changing the
x-coordinate from 320 to 120.

In addition to these things, you can also update the appearance of the Node or
delete the Node. For more details, visit the [Node documentation](node.md).

### Edges

Edges are lines rendered on to the paper. They can serve to connect Nodes, or
they can be placed independently.

Let's place an Edge:

```js
// This assumes you have two Nodes on the paper with the following IDs:
//  - 'example-node-1'
//  - 'example-node-2'

myPaper.addEdge({
  id: 'example-edge',
  component: Edge,
  source: { id: 'example-node-1' },
  target: { id: 'example-node-2' },
  coords: [],
});
```

Now you have an Edge that connects the two Nodes! Psiagram does all the hard
work of calculating how to connect them, you just give it the IDs.

You can also update the Edge's appearance, update the route to allow for custom
routing, and delete the Edge. For more information, check out the
[Edge documentation](edge.md).

### Active Item

Psiagram has a concept of an active item. This is the current item of focus,
such as a recently-clicked Node. How you choose to represent the active item is
your choice. Psiagram provides an API to get the current active item, or to set
the active item yourself.

Lets check if there is an active item, and if not, set a Node to 'selected':

```js
// This assumes you have a Node on the paper with the following ID:
//  - 'example-node'

function setActiveItemToExampleNode() {
  const activeItem = myPaper.getActiveItem();

  if (activeItem === null) {
    myPaper.updateActiveItem({
      workflowType: 'node',
      id: 'example-node',
      paperItemState: 'selected',
    });
  } else {
    console.log('Another item is already active. Try again later.');
  }
}
```

This sets the Node with id='example-node' as an active item with selected state
if no other components of Paper are currently the active item.

### Listeners and Events

Listeners provide high levels of control over the lifecycle and rendering of the
Paper. These will be discussed more in depth in the (upcoming) Advanced
documentation. For now, here is the basics.

When an event occurs, this is what happens:

1.  A Paper Event is created for the specific paper event type. It contains:
    - The paper event type (a string representing the event)
    - A reference to the Paper instance that created the event
    - The target of the event (ex: the Node that is being created)
    - Any additional helpful data (ex: the Node coordinates rounded to nearest
      grid)
    - A boolean representing whether the event will continue to propagate to
      other listeners
    - A default action to be carried out once after all listeners have been
      called
1.  All listeners for that specific paper event type are called with the Paper
    Event. They can:
    - Access the API of the issuing Paper instance to do any method calls
    - Do any sort of validation given the target and data of the event
    - Transform any properties of the target (ex: change an added Node's
      coordinates)
    - Call the stopPropagation method to prevent any other listeners from
      getting called
    - Call the preventDefault method to prevent the Paper Event's default action
      from being completed
1.  The default action is completed if preventDefault was not called by any
    listener

This lifecycle provides multiple utilities to allow you to build complex
functionality. That will be touched on in the (upcoming) Advanced
documentation - for now, let's do some easy stuff.

```js
// To add a listener:
myPaper.addListener('add-node', myListenerCallback);

// To remove that listener:
myPaper.removeListener('add-node', myListenerCallback);
```

---

It's as easy as that! You've now seen the basics of Paper.

> 🚧 Full API and Advanced Section are coming! 🚧
>
> This will include complete specifications of the Paper API, as well as
> advanced use cases for active items and anything else you see in this
> documentation.
