import {
  Paper, // Paper class.
  IPaperProps, // Object to initialize paper.
  IPaperInputNode, // Object to add node.
  IPaperInputEdge, // Object to add edge.
  IActiveItem, // Object to change active item.
  Node, // Node class.
  Edge, // Edge class.
  ICoordinates, // Object to represent coordinates on paper.
} from '../src';

let myPaper: Paper | null = null;

function loadPaper() {
  const paperProps: IPaperProps = {
    attributes: { gridSize: 20 },
    height: '900px',
    width: '1300px',
    plugins: [],
    initialConditions: {
      nodes: [
        {
          id: 'node1',
          component: Node,
          coords: { x: 80, y: 80 },
          props: { width: 80, height: 80, title: 'node 1' },
        },
        {
          id: 'node2',
          component: Node,
          coords: { x: 240, y: 80 },
          props: { width: 80, height: 80, title: 'node 2' },
        },
      ],
      edges: [
        {
          id: 'edge1',
          component: Edge,
          source: { id: 'node1' },
          target: { id: 'node2' },
          coords: [],
          props: { title: 'edge 1' },
        },
      ],
    },
  };

  myPaper = new Paper(paperProps);

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
      props: {
        height: 80,
        title: 'Title 1',
        width: 160,
      },
    };
    myPaper.addNode(node);
  }
}

// Add node on button click.
document.getElementById('_testbutton').addEventListener('click', addNode);

// Load paper element once DOM is loaded.
document.addEventListener('DOMContentLoaded', () => loadPaper());
