// tslint:disable:no-console
import {
  Paper,
  IPaperProperties,
  IPaperInputNode,
  Node,
  Edge,
  PaperError,
} from 'psiagram';
import { Grid } from 'psiagram-plugin-grid';
import { MouseEvents } from 'psiagram-plugin-mouse-events';

let myPaper: Paper | null = null;

function loadPaper() {
  const paperProperties: IPaperProperties = {
    attributes: { gridSize: 20 },
    height: 900,
    width: 1300,
    plugins: [new Grid(), new MouseEvents()],
    initialConditions: {
      nodes: [
        {
          id: 'node1',
          component: Node,
          coords: { x: 60, y: 220 },
          properties: { width: 112, height: 85, title: 'node 1' },
        },
        {
          id: 'node2',
          component: Node,
          coords: { x: 400, y: 220 },
          properties: { width: 130, height: 75, title: 'node 2' },
        },
      ],
      edges: [
        {
          id: 'edge1',
          component: Edge,
          source: { x: 120, y: 120 },
          target: { id: 'node1' },
          coords: [],
        },
        {
          id: 'edge2',
          component: Edge,
          source: { id: 'node1' },
          target: { id: 'node2' },
          coords: [],
          properties: { title: 'edge 2' },
        },
        {
          id: 'edge3',
          component: Edge,
          source: { id: 'node2' },
          target: { x: 600, y: 460 },
          coords: [{ x: 469, y: 469 }],
        },
      ],
    },
  };

  myPaper = new Paper(paperProperties);

  function eventListener(evt) {
    // prettier-ignore
    console.log(
      '=========================',
      '\nevent: ', evt,
      '\neventType: ', evt.eventType,
      '\npaper: ', evt.paper,
      '\ntarget: ', evt.target,
      '\ncanPropagate: ', evt.canPropagate,
      '\ndata: ', evt.data,
      '\n=========================',
    );
  }

  // Node listeners
  // myPaper.addListener('add-node', eventListener);
  // myPaper.addListener('move-node', eventListener);
  // myPaper.addListener('remove-node', eventListener);

  // Edge listeners
  // myPaper.addListener('add-edge', eventListener);
  // myPaper.addListener('move-edge', eventListener);
  // myPaper.addListener('remove-edge', eventListener);

  // Paper listeners
  // myPaper.addListener('update-active-item', eventListener);

  // Append paper into div #_target
  const target = document.getElementById('_target');
  target.appendChild(myPaper.getPaperElement());
}

function addNode() {
  if (myPaper) {
    const node: IPaperInputNode = {
      component: Node,
      coords: {
        x: 320,
        y: 160,
      },
      id: `new_node_test`,
      properties: {
        height: 80,
        title: 'Title 1',
        width: 160,
      },
    };

    // myPaper.addNode(node);

    try {
      myPaper.addNode(node);
    } catch (err) {
      const error = err as PaperError;
      console.error(error.toString());
    }
  }
}

function moveNode() {
  const node = document.getElementById('new_node_test');
  if (myPaper && node) {
    const nodeInstance = myPaper.getNode('new_node_test');
    nodeInstance.coords = { x: 0, y: 0 };
  }
}

document.getElementById('_addNodeButton').addEventListener('click', addNode);
document.getElementById('_moveNodeButton').addEventListener('click', moveNode);

// Load paper element once DOM is loaded.
document.addEventListener('DOMContentLoaded', () => loadPaper());
