import {
  createElementWithAttributes,
  createSVGWithAttributes,
} from '../utilities/domUtils';
import { setPaperDefs } from './PaperDefs';
import { INode, INodeProps } from '../Node/INode';
import { IEdge, IEdgeProps } from '../Edge/IEdge';
import {
  setWorkflowType,
  getWorkflowType,
  WorkflowType,
} from '../utilities/dataUtils';
import {
  IPaper,
  IPaperStoredNode,
  IPaperStoredEdge,
  IPaperProps,
  IPaperInputNode,
} from './IPaper';

export class Paper implements IPaper {
  private _width: string;
  private _height: string;
  private _plugins: Array<Object>;
  private _nodes: { [key: string]: IPaperStoredNode };
  private _edges: { [key: string]: IPaperStoredEdge };
  private _gridSize: number;
  private _allowBlockOverlap: boolean;
  private _paperWrapper: HTMLElement;
  private _paper: SVGElement;

  constructor({
    width,
    height,
    plugins,
    attributes,
    initialConditions,
  }: IPaperProps) {
    // Workspace parameters.
    this._width = width;
    this._height = height;
    this._plugins = plugins;
    this._nodes = {};
    this._edges = {};

    // Workspace IDs.
    const randomId = Math.round(Math.random() * 10000000)
      .toString(36)
      .concat('0000')
      .substring(0, 4);
    const paperWrapperId = `paper-wrapper_${randomId}`;
    const paperId = `paper_${randomId}`;

    // Additional parameters or defaults.
    this._gridSize = attributes.gridSize || 0;
    this._allowBlockOverlap = attributes.allowBlockOverlap || false;
    const gridColor: string = attributes.gridColor || '#EEE';
    const paperWrapperClass: string = attributes.paperWrapperClass || '';
    const paperClass: string = attributes.paperClass || '';

    // Paper Wrapper set up.
    const PWAttributes = {};
    PWAttributes['id'] = paperWrapperId;
    PWAttributes['style'] = `width:${this._width}; height:${this._height}`;
    if (paperWrapperClass) {
      PWAttributes['class'] = paperWrapperClass;
    }
    this._paperWrapper = createElementWithAttributes('div', PWAttributes);

    // Paper set up.
    const PAttributes: Object = {};
    PAttributes['id'] = paperId;
    PAttributes['width'] = '100%';
    PAttributes['height'] = '100%';
    if (paperClass) {
      PAttributes['class'] = paperClass;
    }
    this._paper = createSVGWithAttributes('svg', PAttributes);

    // Add defs to paper.
    setPaperDefs(this._paper, this._gridSize, gridColor);

    // Set workflow type attribute to node.
    setWorkflowType(this._paper, WorkflowType.Paper);

    // Append paper into wrapper.
    this._paperWrapper.appendChild(this._paper);

    // Add mousedown event listener to paper wrapper.
    this._paperWrapper.addEventListener('mousedown', this._handleMouseDown);

    // Add initial nodes and edges to paper.
    if (initialConditions.nodes) {
      initialConditions.nodes.forEach(node => this.addNode(node));
    }
    if (initialConditions.edges) {
      initialConditions.edges.forEach(edge => this.addEdge(edge));
    }
  }

  getPaperElement(): HTMLElement {
    return this._paperWrapper;
  }

  addNode(node: IPaperInputNode) {
    if (this._nodes.hasOwnProperty(node.id)) {
      // TODO: Implement an error callback? We could have some sort of error
      // coding system to allow for localization.
      console.error(`Add node: node with id ${node.id} already exists.`);
    } else {
      // Create instance by calling the class at node.component
      const component: any = node.component;
      const instance: INode = new component({
        ...node.props,
        gridSize: this._gridSize,
        id: node.id,
      });
      const params = instance.getParameters();
      const ref = instance.getNodeElement();

      this._nodes[node.id] = {
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
        this._paper.appendChild(ref);
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
    if (this._nodes.hasOwnProperty(id)) {
      // Remove all edges that use node as end point.
      Object.keys(this._edges).forEach(edgeId => {
        const edge = this._edges[edgeId];
        if (edge.source.id === id || edge.target.id === id) {
          this.removeEdge(edgeId);
        }
      });
      // Remove node.
      this._nodes[id].ref.remove();
      delete this._nodes[id];
    } else {
      console.error(`Delete node: node with id ${id} does not exist.`);
    }
  }

  updateNode(id: string, newProps: INodeProps): void {
    // TODO: WHAT GOES DOWN TO NODE WHAT STAYS HERE!!!
    if (this._nodes.hasOwnProperty(id)) {
      this._nodes[id].instance.updateProps(newProps);
    } else {
      console.error(`Update node: node with id ${id} does not exist.`);
    }
  }

  addEdge(edge: Object): void {
    // TODO: implement.
  }

  removeEdge(id: string): void {
    if (this._edges.hasOwnProperty(id)) {
      this._edges[id].ref.remove();
      delete this._edges[id];
    } else {
      console.error(`Delete edge: edge with id ${id} does not exist.`);
    }
  }

  updateEdge(id: string, newProps: IEdgeProps): void {
    if (this._edges.hasOwnProperty(id)) {
      this._edges[id].instance.updateProps(newProps);
    } else {
      console.error(`Update edge: edge with id ${id} does not exist.`);
    }
  }

  init() {
    // TODO: add listeners if they don't currently exist
  }

  uninit() {
    // TODO: remove listeners
  }

  private _handleMouseDown = (evt: MouseEvent) => {
    const target = evt.target as Element;
    // This targets the parent of the clicked element. The parent is either
    // <svg> for Paper, or <g> for Node or Edge.
    const containerElement = target.parentElement;
    const workflowType = getWorkflowType(containerElement);

    switch (workflowType) {
      case WorkflowType.Node:
        this._handleNodeMouseDown(evt, containerElement);
        break;
      case WorkflowType.Edge:
        break;
      case WorkflowType.Paper:
        break;
      default:
        break;
    }
  };

  private _handleNodeMouseDown = (
    evt: MouseEvent,
    containerElement: Element,
  ) => {
    console.log('yep its a node');
  };
}
