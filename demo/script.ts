import {
  /**
   * Paper
   */
  Paper, // Paper class.
  IPaper, // Paper class interface.
  IPaperProps, // Object to initialize paper.
  IPaperInputNode, // Object to add node.
  IPaperInputEdge, // Object to add edge.
  IActiveItem, // Object to change active item.
  /**
   * Node
   */
  Node, // Node class.
  INodeProps, // Object to initialize node.
  /**
   * Edge
   */
  // Edge, // Edge class.
  IEdgeProps, // Object to initialize edge.
  /**
   * Other
   */
  ICoordinates, // Object to represent coordinates on paper.
} from '../src';

let myPaper: IPaper | null = null;

function loadPaper() {
  const paperProps: IPaperProps = {
    attributes: {
      gridSize: 20,
    },
    height: '900px',
    initialConditions: {},
    plugins: [],
    width: '1300px',
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
