# Core Concepts

In Psiagram, the main piece you will work with is the Paper. This is contained
in the `psiagram` package, and provides the API you will use to interact and
manipulate the graph you are building.

The things you can use to control the paper are:

1.  The properties passed into Paper during initialization
1.  The API of the paper object (methods and listeners)
1.  Plugins that are passed into the paper during initialization

Here is an example of a very basic Paper initialization. You don't have to
understand everything right now! If you want more details on anything below,
check out the Core section.

```js
// The main building blocks of Psiagram are Paper, Nodes and Edges.
import { Paper, Node, Edge } from 'psiagram';

// This is an example of a plugin (and a useful one at that).
import { MouseEvents } from 'psiagram-plugin-mouse-events';

// Paper variable is created outside of the function because you'll need this
// instance to be able to access the mounted paper's API later.
let myPaper = null;

function mountPaperInApplication() {
  // 1. Initialize plugins with any settings they take.
  //    (MouseEvents plugin doesn't require any settings at initialization).
  const initializedMouseEventPlugin = new MouseEvents();

  // 2. Build out all of the properties to initialize the paper with.
  //    You can see the details of this in the Core section
  const paperProperties = {
    attributes: { gridSize: 20 },
    height: 900,
    width: 1300,
    plugins: [initializedMouseEventPlugin],
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
  };

  // 3. Initialize paper with the Paper Properties built above.
  myPaper = new Paper(paperProperties);

  // 4. At this point, you can really do anything you want to do before mounting
  //    the paper. For this example, let's add a listener.
  myPaper.addListener('add-node', someCoolCallbackFunction);

  // 5. Now that the paper is all set up, it's time to get the actual element!
  //    This will continue to be manipulated by the Paper instance even once it
  //    is mounted in the DOM.
  const paperElement = myPaper.getPaperElement();

  // 6. Now you're ready to mount the element into the DOM!
  const target = document.getElementById('_target');
  target.appendChild(paperElement);
}
```

That's it! You now have a paper being rendered in your application with some
initial nodes and edges rendered onto it! From here, any manipulation can be
done using the API contained within the paper instance `myPaper`. Mouse events
like moving and selecting are already done for free thanks to the `MouseEvents`
plugin.
