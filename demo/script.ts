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
  Coordinates, // Object to represent coordinates on paper.
} from '../src';

var myPaper: IPaper | null = null;

function loadPaper() {
  const paperProps: IPaperProps = {
    width: '1300px',
    height: '900px',
    plugins: [],
    attributes: {
      gridSize: 20,
    },
    initialConditions: {},
  };

  myPaper = new Paper(paperProps);

  // Append paper into div #_target
  const target = document.getElementById('_target');
  target.appendChild(myPaper.getPaperElement());
}

function addNode() {
  if (myPaper) {
    const node: IPaperInputNode = {
      id: `new_node_test`,
      component: Node,
      props: {
        width: 160,
        height: 80,
        title: 'Title 1',
      },
      coords: {
        x: 320,
        y: 160,
      },
    };
    myPaper.addNode(node);
  }
}

// Add node on button click.
document.getElementById('_testbutton').addEventListener('click', addNode);

// Load paper element once DOM is loaded.
document.addEventListener('DOMContentLoaded', () => loadPaper());
