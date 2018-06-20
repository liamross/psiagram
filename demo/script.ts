// tslint:disable:no-console
// @ts-ignore
import {
  Paper,
  IPaperProperties,
  IPaperInputNode,
  Node,
  Edge,
  PaperError,
} from 'psiagram';
// @ts-ignore
import { Grid } from 'psiagram-plugin-grid';
// @ts-ignore
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
          coords: { x: 80, y: 80 },
          properties: { width: 112, height: 85, title: 'node 1' },
        },
        {
          id: 'node2',
          component: Node,
          coords: { x: 240, y: 70 },
          properties: { width: 130, height: 75, title: 'node 2' },
        },
      ],
      edges: [
        {
          id: 'edge1',
          component: Edge,
          source: { id: 'node1' },
          target: { id: 'node2' },
          coords: [],
          properties: { title: 'edge 1' },
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
  // myPaper.addListener('update-node', eventListener);
  // myPaper.addListener('move-node', eventListener);
  // myPaper.addListener('remove-node', eventListener);

  // Edge listeners
  // myPaper.addListener('add-edge', eventListener);
  // myPaper.addListener('update-edge', eventListener);
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
    myPaper.moveNode('new_node_test', { x: 0, y: 0 });
  }
}

document.getElementById('_addNodeButton').addEventListener('click', addNode);
document.getElementById('_moveNodeButton').addEventListener('click', moveNode);

// Load paper element once DOM is loaded.
document.addEventListener('DOMContentLoaded', () => loadPaper());
