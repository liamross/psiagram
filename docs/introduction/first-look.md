# First Look

This page is going to jump into some large concepts pretty quickly. It will give
you a feel for the basic set-up of the framework. **You don't have to understand
everything right now!** Once you have taken a peek and are craving something
more in-depth and well-explained, head to the
[basics section](../basics/README.md).

To start, let's import all of the tools we are going to need. The main building
blocks of Psiagram are Paper, Nodes and Edges. In addition, you can enhance
Psiagram with various Plugins:

```js
import { Paper, Node, Edge } from 'psiagram';
import { MouseEvents } from 'psiagram-plugin-mouse-events';
```

Set up a variable to assign the instance of Paper to:

```js
let myPaper = null;
```

Let's build out an example function to run once the page is loaded. It mounts an
initialized Paper into a div with id="\_target".

```js
function initializeAndMountPaper() {
  // 1. Initialize plugins with any settings they require
  //    (MouseEvents plugin doesn't require any settings at initialization)
  const initializedMouseEvents = new MouseEvents();

  // 2. Initialize Paper with any initial Paper Properties you want to pass to
  //    Paper during initialization.
  myPaper = new Paper({
    attributes: { gridSize: 20 },
    height: 900,
    width: 1300,
    plugins: [initializedMouseEvents],
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

  // 3. At this point, you can really do anything you want to do before mounting
  //    the Paper. For this example, let's add some listeners.
  //    (You can actually call Paper methods any time, not just before mounting)
  myPaper.addListener('add-node', validateAddedNode);
  myPaper.addListener('move-node', drawRainbowTrailBehindNode);

  // 4. Now that the Paper is all set up, it's time to get the actual element!
  //    This will continue to be manipulated by the Paper instance even once it
  //    is mounted in the DOM.
  const paperElement = myPaper.getPaperElement();

  // 5. Now you're ready to mount the element into the DOM! Assume that we have
  // already set up a target div with id="_target" to mount the Paper to.
  const target = document.getElementById('_target');
  target.appendChild(paperElement);
}
```

Now that the Paper is mounted, try building a function that will remove an Edge
based on its ID:

```js
function removeEdgeFromPaper(edgeId) {
  myPaper.removeEdge(edgeId);
}
```

Here's an example function that prohibits adding any Nodes with a height over
200px. This is a pretty basic example, but you can do very complex things with
the listener API.

```js
function validateAddedNode(paperEvent) {
  const targetNode = paperEvent.target;

  const nodeWidthHeight = targetNode.getParameters;

  if (nodeWidthHeight.height > 200) {
    paperEvent.preventDefault();
  }
}
```

And finally:

```js
function drawRainbowTrailBehindNode(paperEvent) {
  // TODO: I'll let you figure out how to do this one.
}
```
