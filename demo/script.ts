/**
 * Import: psiagram
 */
// prettier-ignore
import { Paper, IPaperProperties, IPaperInputNode, IPaperInputEdge, IActiveItem, Node, Edge, ICoordinates, } from '../packages/psiagram/src';

let myPaper: Paper | null = null;

function loadPaper() {
  const paperProperties: IPaperProperties = {
    attributes: { gridSize: 20 },
    height: 900,
    width: 1300,
    plugins: [],
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

  const listenerBuilder = listenerType => (env, data) => {
    // tslint:disable-next-line
    console.log(
      '=========================',
      '\nlistener type: ',
      listenerType,
      '\nenv:',
      env,
      '\ndata:',
      data,
      '\n=========================',
    );
  };

  // Node listeners
  // myPaper.addListener('add-node', listenerBuilder('add-node'));
  // myPaper.addListener('update-node', listenerBuilder('update-node'));
  // myPaper.addListener('move-node', listenerBuilder('move-node'));
  // myPaper.addListener('remove-node', listenerBuilder('remove-node'));

  // Edge listeners
  // myPaper.addListener('add-edge', listenerBuilder('add-edge'));
  // myPaper.addListener('update-edge', listenerBuilder('update-edge'));
  // myPaper.addListener('move-edge', listenerBuilder('move-edge'));
  // myPaper.addListener('remove-edge', listenerBuilder('remove-edge'));

  // Paper listeners
  // prettier-ignore
  // myPaper.addListener('update-active-item', listenerBuilder('update-active-item'));

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
    myPaper.addNode(node);
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
