// tslint:disable:no-console

import {
  // Paper
  Paper,
  IPaperProperties,
  IPaperInputNode,

  // Nodes
  Node,
  Rectangle,
  IRectangleProperties,

  // Edges
  Edge,
  Line,
  TextLine,
  ITextLineProperties,

  // Other
  PaperError,
  PaperEvent,
} from 'psiagram';

import { Grid } from 'psiagram-plugin-grid';
import { MouseEvents } from 'psiagram-plugin-mouse-events';
import { ManhattanRouting } from 'psiagram-plugin-routing';

let myPaper: Paper | null = null;

/**
 * Initialize myPaper and mount Paper into html.
 */
function loadPaper() {
  const paperProperties: IPaperProperties = {
    attributes: { gridSize: 20 },
    height: 900,
    width: 1300,
    plugins: [new Grid(), new MouseEvents(), new ManhattanRouting()],
    initialConditions: {
      nodes: [
        {
          id: 'node1',
          component: 'rectangle',
          coords: { x: 60, y: 260 },
          properties: {
            width: 112,
            height: 85,
            title: 'node 1',
          } as IRectangleProperties,
        },
        {
          id: 'node2',
          component: 'rectangle',
          coords: { x: 400, y: 220 },
          properties: {
            width: 130,
            height: 140,
            title: 'node 2',
          } as IRectangleProperties,
        },
        {
          id: 'node3',
          component: 'rectangle',
          coords: { x: 400, y: 600 },
          properties: {
            width: 100,
            height: 100,
            title: 'node 3',
          } as IRectangleProperties,
        },
      ],
      nodeComponentMap: {
        rectangle: Rectangle as typeof Node,
      },
      edges: [
        {
          id: 'edge1',
          component: 'line',
          source: { x: 120, y: 120 },
          target: { id: 'node1' },
          coords: [],
        },
        {
          id: 'edge2',
          component: 'text-line',
          source: { id: 'node1' },
          target: { id: 'node2' },
          coords: [],
          properties: { title: 'Edge 2' } as ITextLineProperties,
        },
        {
          id: 'edge3',
          component: 'line',
          source: { id: 'node2' },
          target: { id: 'node3' },
          coords: [],
        },
        {
          id: 'edge4',
          component: 'text-line',
          source: { id: 'node3' },
          target: { x: 800, y: 800 },
          properties: { title: 'Edge 4' } as ITextLineProperties,
          coords: [],
        },
      ],
      edgeComponentMap: {
        line: Line as typeof Edge,
        'text-line': TextLine as typeof Edge,
      },
    },
  };

  myPaper = new Paper(paperProperties);

  addListeners();

  // Append paper into div #_target
  const target = document.getElementById('_target');
  target.appendChild(myPaper.getPaperElement());
}

/**
 * Add new_node_test to the Paper if not already added.
 */
function addNode() {
  if (myPaper) {
    const node: IPaperInputNode = {
      component: 'rectangle',
      coords: {
        x: 320,
        y: 160,
      },
      id: `new_node_test`,
      properties: {
        height: 60,
        title: 'Title 1',
        width: 160,
      },
    };

    try {
      myPaper.addNode(node);
    } catch (err) {
      const error = err as PaperError;
      console.error(error.toString());
    }
  }
}

/**
 * Move new_node_test to 0,0 on the Paper if it exists.
 */
function moveNode() {
  if (myPaper) {
    try {
      const nodeInstance = myPaper.getNode('new_node_test');
      nodeInstance.coords = { x: 0, y: 0 };
    } catch (err) {
      const error = err as PaperError;
      console.error(error.toString());
    }
  }
}

/**
 * Add listeners to myPaper if it is initialized.
 */
function addListeners() {
  if (myPaper) {
    function eventListener(evt: PaperEvent) {
      console.log({
        EVENT: evt.eventType
          .replace(/-/g, ' ')
          .replace(/^\w/, c => c.toUpperCase()),
        PROPERTIES: {
          canPropagate: evt.canPropagate,
          data: evt.data,
          eventType: evt.eventType,
          paper: evt.paper,
          target: evt.target,
        },
        METHODS: {
          defaultAction: evt.defaultAction,
          preventDefault: evt.preventDefault,
          stopPropagation: evt.stopPropagation,
        },
      });
    }

    // ENABLE LISTENERS AS NEEDED.

    // Node listeners:

    // myPaper.addListener('add-node', eventListener);
    // myPaper.addListener('move-node', eventListener);
    // myPaper.addListener('remove-node', eventListener);

    // Edge listeners:

    // myPaper.addListener('add-edge', eventListener);
    // myPaper.addListener('move-edge', eventListener);
    // myPaper.addListener('remove-edge', eventListener);

    // Paper listeners:

    // myPaper.addListener('update-active-item', eventListener);
  }
}

document.getElementById('_addNodeButton').addEventListener('click', addNode);
document.getElementById('_moveNodeButton').addEventListener('click', moveNode);

// Load paper element once DOM is loaded.
document.addEventListener('DOMContentLoaded', () => loadPaper());
