import {
  createElementWithAttributes,
  createSVGWithAttributes,
} from '../utilities/domUtils';
import { setPaperDefs } from './PaperDefs';

export class Paper {
  constructor({ width, height, plugins, attributes, initialConditions }) {
    // Workspace parameters.
    this.width = width;
    this.height = height;
    this.plugins = plugins;
    this.nodes = {};
    this.edges = {};

    // Workspace IDs.
    const randomId = Math.round(Math.random() * 1000000);
    this.paperWrapperId = `paper-wrapper_${randomId}`;
    this.paperId = `paper_${randomId}`;

    // Additional parameters or defaults.
    this.gridSize = attributes.gridSize || 0;
    this.gridColor = attributes.gridColor || '#EEE';
    this.allowBlockOverlap = attributes.allowBlockOverlap || false;
    const paperWrapperClass = attributes.paperWrapperClass || '';
    const paperClass = attributes.paperClass || '';

    // Paper Wrapper set up.
    const PWAttributes = {};
    PWAttributes.id = this.paperWrapperId;
    // TODO: onmousedown listener.
    PWAttributes.style = `width:${this.width}; height:${this.height}`;
    if (paperWrapperClass) {
      PWAttributes.class = paperWrapperClass;
    }
    this.paperWrapper = createElementWithAttributes('div', PWAttributes);

    // Paper set up.
    const PAttributes = {};
    PAttributes.id = this.paperId;
    PAttributes.width = '100%';
    PAttributes.height = '100%';
    if (paperClass) {
      PAttributes.class = paperClass;
    }
    this.paper = createSVGWithAttributes('svg', PAttributes);

    // Add defs to paper.
    setPaperDefs(this.paper, this.gridSize, this.gridColor);

    // Append paper into wrapper.
    this.paperWrapper.appendChild(this.paper);

    // Add initial nodes and edges to paper.
    if (initialConditions.nodes) {
      initialConditions.nodes.forEach(node => this.addNode(node));
    }
    if (initialConditions.edges) {
      initialConditions.edges.forEach(edge => this.addEdge(edge));
    }
  }

  /**
   * Returns the paper wrapped in paper wrapper.
   * @returns {Element}
   */
  getPaperElement() {
    return this.paperWrapper;
  }

  /**
   * Adds a node to this.nodes, and then renders the ref onto this.paper.
   * @param {Object} node - A node to add.
   */
  addNode(node) {
    if (this.nodes.hasOwnProperty(node.id)) {
      console.error(`Add node: node with id ${node.id} already exists.`);
    } else {
      const instance = new node.component({
        ...node.props,
        gridSize: this.gridSize,
      });
      const params = instance.getParameters();
      const ref = instance.getNodeElement();

      this.nodes[node.id] = {
        id: node.id, // Unique ID of node.
        coords: node.coords, // {x: number, y: number [, z: number]}.
        params, // {width: number, height: number}.
        instance, // Instance of node class.
        ref, // Reference to instance's element.
      };

      if (ref) {
        ref.setAttributeNS(
          null,
          'transform',
          `translate(${node.coords.x} ${node.coords.y})`,
        );
        this.paper.appendChild(ref);
      } else {
        console.error(
          'Add node: invalid element returned from node class\n' +
            'Node ID: ' +
            node.id,
        );
      }
    }
  }

  removeNode(id) {
    if (this.nodes.hasOwnProperty(id)) {
      // Remove all edges that use node as end point.
      Object.keys(this.edges).forEach(edgeId => {
        const edge = this.edges[edgeId];
        if (edge.source.id === id || edge.target.id === id) {
          removeEdge(edgeId);
        }
      });
      // Remove node.
      this.nodes[id].ref.remove();
      delete this.nodes[id];
    } else {
      console.error(`Delete node: node with id ${id} does not exist.`);
    }
  }

  updateNode(id, newProps) {
    // TODO: WHAT GOES DOWN TO NODE WHAT STAYS HERE!!!
    if (this.nodes.hasOwnProperty(id)) {
      this.nodes[id].instance.updateProps(newProps);
    } else {
      console.error(`Update node: node with id ${id} does not exist.`);
    }
  }

  addEdge(edge) {
    // TODO: implement.
  }

  removeEdge(id) {
    if (this.edges.hasOwnProperty(id)) {
      this.edges[id].ref.remove();
      delete this.edges[id];
    } else {
      console.error(`Delete edge: edge with id ${id} does not exist.`);
    }
  }

  updateEdge(id, newProps) {
    if (this.edges.hasOwnProperty(id)) {
      this.edges[id].instance.updateProps(newProps);
    } else {
      console.error(`Update edge: edge with id ${id} does not exist.`);
    }
  }
}
