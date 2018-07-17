// tslint:disable:no-console
import {
  Paper,
  IPaperProperties,
  IPaperInputNode,
  Node,
  Edge,
  PaperError,
} from 'psiagram';
// import { Grid } from 'psiagram-plugin-grid';
// import { MouseEvents } from 'psiagram-plugin-mouse-events';
// import { ManhattanRouting } from 'psiagram-plugin-routing';
import { Grid } from '../packages/psiagram-plugin-grid/src';
import { MouseEvents } from '../packages/psiagram-plugin-mouse-events/src';
import { ManhattanRouting } from '../packages/psiagram-plugin-routing/src';

let myPaper: Paper | null = null;

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
          component: Node,
          coords: { x: 60, y: 260 },
          properties: { width: 112, height: 85, title: 'node 1' },
        },
        {
          id: 'node2',
          component: Node,
          coords: { x: 400, y: 220 },
          properties: { width: 130, height: 140, title: 'node 2' },
        },
        {
          id: 'node3',
          component: Node,
          coords: { x: 400, y: 600 },
          properties: { width: 100, height: 100, title: 'node 3' },
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
          target: { id: 'node3' },
          coords: [],
        },
        {
          id: 'edge4',
          component: Edge,
          source: { id: 'node3' },
          target: { x: 800, y: 800 },
          coords: [],
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
        height: 60,
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
