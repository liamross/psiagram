import { setPaperDefs } from './PaperDefs';
import { INode, INodeProps } from '../Node/INode';
import { IEdge, IEdgeProps } from '../Edge/IEdge';
import { roundToNearest } from '../utilities/workflowUtils';
import {
  setWorkflowType,
  getWorkflowType,
  WorkflowType,
} from '../utilities/dataUtils';
import {
  createElementWithAttributes,
  createSVGWithAttributes,
  setSVGAttribute,
} from '../utilities/domUtils';
import {
  IPaper,
  IPaperProps,
  IActiveItem,
  PaperItemState,
  IPaperInputNode,
  IPaperStoredNode,
  IPaperInputEdge,
  IPaperStoredEdge,
  Coordinates,
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
  private _initialMouseCoords: Coordinates | null;
  private _initialPaperCoords: Coordinates | null;
  private _activeItem: {
    workflowType: WorkflowType;
    id: string;
    paperItemState: PaperItemState;
  } | null;

  constructor({
    width,
    height,
    plugins,
    attributes,
    initialConditions,
  }: IPaperProps) {
    this._width = width;
    this._height = height;
    this._plugins = plugins;
    this._nodes = {};
    this._edges = {};
    this._initialMouseCoords = null;
    this._initialPaperCoords = null;
    this._activeItem = null;

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
        setSVGAttribute(
          ref,
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

  updateNode(
    id: string,
    newProps: { props?: INodeProps; coords?: Coordinates },
  ): void {
    if (this._nodes.hasOwnProperty(id)) {
      const { props, coords } = newProps;
      const node = this._nodes[id];

      // If newProps has props, call updateProps on node instance.
      if (props) {
        node.instance.updateProps(props);
      }

      // If newProps has coords, update coordinates in paper.
      if (coords) {
        node.coords = coords;
        this._redrawNode(id);
      }
    } else {
      console.error(`Update node: node with id ${id} does not exist.`);
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

  addEdge(edge: IPaperInputEdge): void {
    // TODO: implement.
  }

  updateEdge(id: string, newProps: IEdgeProps): void {
    if (this._edges.hasOwnProperty(id)) {
      this._edges[id].instance.updateProps(newProps);
    } else {
      console.error(`Update edge: edge with id ${id} does not exist.`);
    }
  }

  removeEdge(id: string): void {
    if (this._edges.hasOwnProperty(id)) {
      this._edges[id].ref.remove();
      delete this._edges[id];
    } else {
      console.error(`Delete edge: edge with id ${id} does not exist.`);
    }
  }

  updateActiveItem(activeItem: IActiveItem = null): void {
    const oldActiveItem = this._activeItem;

    if (oldActiveItem) {
      // If all keys are identical, warn and exit function. Else, do exit
      // actions on the previous active item.
      if (
        activeItem &&
        Object.keys(activeItem).every(
          key => oldActiveItem[key] === activeItem[key],
        )
      ) {
        console.error(
          `Update active item: the ${activeItem.workflowType} with id "${
            activeItem.id
          }" is already ${activeItem.paperItemState}.`,
        );

        return;
      } else {
        // TODO: Do any 'exit' actions on oldActiveItem.
      }
    }

    // Update active item.
    this._activeItem = activeItem;

    if (activeItem) {
      // TODO: Do any 'initialization' actions on the new active item.
    }
  }

  init() {
    // TODO: add listeners if they don't currently exist
  }

  uninit() {
    // TODO: remove listeners
  }

  private _redrawNode = (id: string): void => {
    if (this._nodes.hasOwnProperty(id)) {
      const node = this._nodes[id];
      setSVGAttribute(
        node.ref,
        'transform',
        `translate(${node.coords.x} ${node.coords.y})`,
      );
    } else {
      console.error(`Redraw node: node with id ${id} does not exist.`);
    }
  };

  private _handleMouseDown = (evt: MouseEvent): void => {
    const containerElement = (evt.target as Element).parentElement;
    const workflowType = getWorkflowType(containerElement);

    switch (workflowType) {
      case WorkflowType.Node:
        this._handleNodeMouseDown(evt, containerElement.id);
        break;
      case WorkflowType.Edge:
        this._handleEdgeMouseDown(evt, containerElement.id);
        break;
      case WorkflowType.Paper:
        // Do we need to give ID?
        this._handlePaperMouseDown(evt, containerElement.id);
        break;
      default:
        break;
    }
  };

  private _handleNodeMouseDown = (evt: MouseEvent, id: string): void => {
    if (this._nodes.hasOwnProperty(id)) {
      const node = this._nodes[id];

      // Set clicked node as moving item.
      this.updateActiveItem({
        workflowType: WorkflowType.Node,
        id,
        paperItemState: PaperItemState.Moving,
      });

      // Store initial mouse coordinates.
      this._initialMouseCoords = { x: evt.clientX, y: evt.clientY };

      // Store original coordinates in paper (to nearest grid).
      this._initialPaperCoords = {
        x: roundToNearest(node.coords.x, this._gridSize),
        y: roundToNearest(node.coords.y, this._gridSize),
      };

      // Initialize mouse movement and release listeners.
      document.addEventListener('mousemove', this._handleNodeMouseMove);
      document.addEventListener('mouseup', this._handleNodeMouseUp);
    } else {
      console.error(
        `Handle node mousedown: node with id ${id} does not exist.`,
      );
    }
  };

  private _handleNodeMouseMove = (evt: MouseEvent): void => {
    if (
      this._activeItem &&
      this._activeItem.workflowType === WorkflowType.Node &&
      this._activeItem.paperItemState === PaperItemState.Moving
    ) {
      const id = this._activeItem.id;

      // Find mouse deltas vs original coordinates.
      const mouseDeltaX = this._initialMouseCoords.x - evt.clientX;
      const mouseDeltaY = this._initialMouseCoords.y - evt.clientY;

      // Find new block coordinates (round mouse delta).
      const blockX =
        this._initialPaperCoords.x -
        roundToNearest(mouseDeltaX, this._gridSize);
      const blockY =
        this._initialPaperCoords.y -
        roundToNearest(mouseDeltaY, this._gridSize);

      this.updateNode(id, { coords: { x: blockX, y: blockY } });

      // TODO: Check if dragged block is overlapping.

      // Update all edges attached to this node.
      Object.keys(this._edges).forEach(edgeId => {
        const edge = this._edges[edgeId];
        if (edge.source.id === id) {
          // TODO: Update the edge source to match the moving node.
        } else if (edge.target.id === id) {
          // TODO: Update the edge target to match the moving node.
        }
      });
    } else {
      console.error(
        `Handle node mousemove: no current moving node. Active item: `,
        this._activeItem,
      );
    }
  };

  private _handleNodeMouseUp = (evt: MouseEvent): void => {
    if (
      this._activeItem &&
      this._activeItem.workflowType === WorkflowType.Node &&
      this._activeItem.paperItemState === PaperItemState.Moving
    ) {
      const id = this._activeItem.id;

      // Set active node to selected state.
      this.updateActiveItem({
        ...this._activeItem,
        paperItemState: PaperItemState.Selected,
      });
    } else {
      console.error(
        `Handle node mouseup: no current moving node. Active item: `,
        this._activeItem,
      );
    }

    // Remove listeners and reset coordinates.
    this._resetMouseListeners();
  };

  private _handleEdgeMouseDown = (evt: MouseEvent, id: string): void => {
    // TODO: implement.
  };

  private _handleEdgeMouseMove = (evt: MouseEvent): void => {
    // TODO: implement.
  };

  private _handleEdgeMouseUp = (evt: MouseEvent): void => {
    // TODO: implement.
  };

  private _handlePaperMouseDown = (evt: MouseEvent, id: string): void => {
    // TODO: implement.

    // Deselect any selected items.
    this.updateActiveItem();
  };

  private _resetMouseListeners = (): void => {
    // Remove listeners.
    document.removeEventListener('mousemove', this._handleNodeMouseMove);
    document.removeEventListener('mouseup', this._handleNodeMouseUp);
    document.removeEventListener('mousemove', this._handleEdgeMouseMove);
    document.removeEventListener('mouseup', this._handleEdgeMouseUp);

    // Reset coordinates.
    this._initialMouseCoords = null;
    this._initialPaperCoords = null;
  };
}
