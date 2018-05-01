import {
  createElementWithAttributes,
  createSVGWithAttributes,
} from '../utilities/domUtils';
import { setPaperDefs } from './PaperDefs';
import { INode, INodeProps } from '../Node/INode';
import { IEdge, IEdgeProps } from '../Edge/IEdge';
import {
  IPaper,
  IPaperInputNode,
  IPaperStoredNode,
  IPaperStoredEdge,
  IPaperProps,
} from './IPaper';

export class Paper implements IPaper {
  private width: string;
  private height: string;
  private plugins: Array<Object>;
  private nodes: { [key: string]: IPaperStoredNode };
  private edges: { [key: string]: IPaperStoredEdge };
  private gridSize: number;
  private allowBlockOverlap: boolean;
  private paperWrapper: HTMLElement;
  private paper: SVGElement;

  constructor({
    width,
    height,
    plugins,
    attributes,
    initialConditions,
  }: IPaperProps) {
    // Workspace parameters.
    this.width = width;
    this.height = height;
    this.plugins = plugins;
    this.nodes = {};
    this.edges = {};

    // Workspace IDs.
    const randomId = Math.round(Math.random() * 1000000).toString(16);
    const paperWrapperId = `paper-wrapper_${randomId}`;
    const paperId = `paper_${randomId}`;

    // Additional parameters or defaults.
    this.gridSize = attributes.gridSize || 0;
    this.allowBlockOverlap = attributes.allowBlockOverlap || false;
    const gridColor: string = attributes.gridColor || '#EEE';
    const paperWrapperClass: string = attributes.paperWrapperClass || '';
    const paperClass: string = attributes.paperClass || '';

    // Paper Wrapper set up.
    const PWAttributes = {};
    PWAttributes['id'] = paperWrapperId;
    // TODO: onmousedown listener.
    PWAttributes['style'] = `width:${this.width}; height:${this.height}`;
    if (paperWrapperClass) {
      PWAttributes['class'] = paperWrapperClass;
    }
    this.paperWrapper = createElementWithAttributes('div', PWAttributes);

    // Paper set up.
    const PAttributes: Object = {};
    PAttributes['id'] = paperId;
    PAttributes['width'] = '100%';
    PAttributes['height'] = '100%';
    if (paperClass) {
      PAttributes['class'] = paperClass;
    }
    this.paper = createSVGWithAttributes('svg', PAttributes);

    // Add defs to paper.
    setPaperDefs(this.paper, this.gridSize, gridColor);

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

  getPaperElement(): HTMLElement {
    return this.paperWrapper;
  }

  addNode(node: IPaperInputNode) {
    if (this.nodes.hasOwnProperty(node.id)) {
      console.error(`Add node: node with id ${node.id} already exists.`);
    } else {
      // Create instance by calling the class at node.component
      const component: any = node.component;
      const instance: INode = new component({
        ...node.props,
        gridSize: this.gridSize,
      });
      const params = instance.getParameters();
      const ref = instance.getNodeElement();

      this.nodes[node.id] = {
        id: node.id,
        coords: node.coords,
        params,
        instance,
        ref,
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
          `Add node: invalid element returned from node class\nNode ID: ${
            node.id
          }`,
        );
      }
    }
  }

  removeNode(id: string): void {
    if (this.nodes.hasOwnProperty(id)) {
      // Remove all edges that use node as end point.
      Object.keys(this.edges).forEach(edgeId => {
        const edge = this.edges[edgeId];
        if (edge.source.id === id || edge.target.id === id) {
          this.removeEdge(edgeId);
        }
      });
      // Remove node.
      this.nodes[id].ref.remove();
      delete this.nodes[id];
    } else {
      console.error(`Delete node: node with id ${id} does not exist.`);
    }
  }

  updateNode(id: string, newProps: INodeProps): void {
    // TODO: WHAT GOES DOWN TO NODE WHAT STAYS HERE!!!
    if (this.nodes.hasOwnProperty(id)) {
      this.nodes[id].instance.updateProps(newProps);
    } else {
      console.error(`Update node: node with id ${id} does not exist.`);
    }
  }

  addEdge(edge: Object): void {
    // TODO: implement.
  }

  removeEdge(id: string): void {
    if (this.edges.hasOwnProperty(id)) {
      this.edges[id].ref.remove();
      delete this.edges[id];
    } else {
      console.error(`Delete edge: edge with id ${id} does not exist.`);
    }
  }

  updateEdge(id: string, newProps: IEdgeProps): void {
    if (this.edges.hasOwnProperty(id)) {
      this.edges[id].instance.updateProps(newProps);
    } else {
      console.error(`Update edge: edge with id ${id} does not exist.`);
    }
  }
}
