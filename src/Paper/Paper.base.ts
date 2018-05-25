import { Node, Edge } from '../';
import { setPaperDefs } from './PaperDefs';
import { ICoordinates } from '../common/types';
import {
  roundToNearest,
  getNodeMidpoint,
  getEdgeNodeIntersection,
} from '../utilities/workflowUtils';
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
  IPaperProps,
  IActiveItem,
  PaperItemState,
  IPaperInputNode,
  IPaperStoredNode,
  IPaperInputEdge,
  IPaperStoredEdge,
  IPaperNodeUpdateProps,
  IPaperEdgeUpdateProps,
} from './';

export class Paper {
  private _width: string;
  private _height: string;
  private _plugins: Array<{}> | null;
  private _nodes: { [key: string]: IPaperStoredNode };
  private _edges: { [key: string]: IPaperStoredEdge };
  private _initialMouseCoords: ICoordinates | null;
  private _initialPaperCoords: ICoordinates | null;
  private _activeItem: IActiveItem | null;
  private _gridSize: number;
  private _allowBlockOverlap: boolean;
  private _paper: SVGElement;
  private _paperWrapper: HTMLElement;

  constructor({
    width,
    height,
    plugins,
    attributes,
    initialConditions,
  }: IPaperProps) {
    // Required parameters.
    this._width = width;
    this._height = height;
    this._nodes = {};
    this._edges = {};
    this._initialMouseCoords = null;
    this._initialPaperCoords = null;
    this._activeItem = null;

    // Optional parameters and defaults.
    this._plugins = plugins || null;
    attributes = attributes || {};
    this._gridSize = attributes.gridSize || 0;
    this._allowBlockOverlap = attributes.allowBlockOverlap || false;
    const gridColor: string = attributes.gridColor || '#EEE';
    const paperWrapperClass: string = attributes.paperWrapperClass || '';
    const paperClass: string = attributes.paperClass || '';

    // Generate base36 IDs that are 4 characters long.
    const randomId = Math.round(Math.random() * 10000000)
      .toString(36)
      .concat('0000')
      .substring(0, 4);
    const paperWrapperId = `paper-wrapper_${randomId}`;
    const paperId = `paper_${randomId}`;

    // Set up paper.
    this._paper = createSVGWithAttributes('svg', {
      id: paperId,
      width: '100%',
      height: '100%',
      class: paperClass || null,
    });
    setPaperDefs(this._paper, this._gridSize, gridColor);
    setWorkflowType(this._paper, WorkflowType.Paper);

    // Set up paper wrapper.
    this._paperWrapper = createElementWithAttributes('div', {
      class: paperWrapperClass || null,
      id: paperWrapperId,
      style: `width:${this._width}; height:${this._height}`,
    });
    this._paperWrapper.appendChild(this._paper);
    this._paperWrapper.addEventListener('mousedown', this._handleMouseDown);

    // Add all initial nodes.
    if (initialConditions && initialConditions.nodes) {
      initialConditions.nodes.forEach(node => this.addNode(node));
    }

    // Add all initial edges.
    if (initialConditions && initialConditions.edges) {
      initialConditions.edges.forEach(edge => this.addEdge(edge));
    }
  }

  /**
   * Returns the paper wrapper which contains an svg paper element, as well as
   * any nodes or edges rendered onto the paper.
   *
   * @returns {HTMLElement} Returns paper wrapper, which contains SVG paper.
   */
  public getPaperElement(): HTMLElement {
    return this._paperWrapper;
  }

  /**
   * Add a node to the paper. This node must be a complete Input Node.
   *
   * @param node The node object to add to paper.
   */
  public addNode(node: IPaperInputNode): void {
    if (this._nodes.hasOwnProperty(node.id)) {
      console.error(`Add node: node with id ${node.id} already exists.`);
    } else {
      // Create instance of class at node.component.
      const instance: Node = new node.component({
        ...node.props,
        gridSize: this._gridSize,
        id: node.id,
      });

      // Get params and ref to element from instance.
      const params = instance.getParameters();
      const ref = instance.getNodeElement();

      // Add node to nodes.
      this._nodes[node.id] = {
        coords: node.coords,
        id: node.id,
        instance,
        params,
        ref,
      };

      // If ref, translate to node.coords and append onto paper.
      if (ref) {
        this.updateNodePosition(node.id, node.coords);
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

  /**
   * Update the appearance of the node with given ID.
   *
   * @param id The ID of the node you wish to update.
   * @param props Props to visually change the node.
   */
  public updateNodeProps(id: string, props: IPaperNodeUpdateProps): void {
    if (this._nodes.hasOwnProperty(id)) {
      const node = this._nodes[id];

      node.instance.updateProps({
        ...props,
        gridSize: this._gridSize,
        id,
      });
    } else {
      console.error(`Update node props: node with id ${id} does not exist.`);
    }
  }

  /**
   * Update a nodes coordinates. This does NOT append the node onto paper.
   *
   * Order of operations:
   *
   * 1. Updates the stored node coordinates.
   *
   * 2. Updates a node position on the paper to provided coordinates.
   *
   * 3. Update edge position on every edge that connects to the node.
   *
   * @param id The ID of the node to update coordinates.
   * @param newCoords The new coordinates of the node.
   */
  public updateNodePosition(id: string, newCoords: ICoordinates): void {
    if (this._nodes.hasOwnProperty(id)) {
      const node = this._nodes[id];

      node.coords = newCoords;

      setSVGAttribute(
        node.ref,
        'transform',
        `translate(${node.coords.x} ${node.coords.y})`,
      );

      Object.keys(this._edges).forEach(edgeId => {
        const edge = this._edges[edgeId];
        if (edge.source.id === id || edge.target.id === id) {
          this.updateEdgePosition(edgeId);
        }
      });
    } else {
      console.error(`Update node position: node with id ${id} does not exist.`);
    }
  }

  /**
   * Removes a node from the paper by node ID.
   *
   * @param id The ID of the node you wish to remove.
   */
  public removeNode(id: string): void {
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

  /**
   * Add an edge to the paper. This edge must be a complete Input Edge.
   *
   * @param edge The edge object to add to paper.
   */
  public addEdge(edge: IPaperInputEdge): void {
    if (this._edges.hasOwnProperty(edge.id)) {
      console.error(`Add edge: edge with id ${edge.id} already exists.`);
    } else {
      // Create instance of class at edge.component.
      const instance: Edge = new edge.component({
        ...edge.props,
        id: edge.id,
      });

      // Get ref to element from instance.
      const ref = instance.getEdgeElement();

      // Add edge to edges.
      this._edges[edge.id] = {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        coords: edge.coords,
        instance,
        ref,
      };

      // If ref, update edge position and append onto paper.
      if (ref) {
        this.updateEdgePosition(edge.id);
        this._paper.appendChild(ref);
      } else {
        console.error(
          `Add edge: invalid element returned from edge class\nEdge ID: ${
            edge.id
          }`,
        );
      }
    }
  }

  /**
   * Update the appearance of the edge with given ID.
   *
   * @param id The ID of the edge you wish to update.
   * @param props Props to visually change the edge.
   */
  public updateEdgeProps(id: string, props: IPaperEdgeUpdateProps): void {
    if (this._edges.hasOwnProperty(id)) {
      const edge = this._edges[id];

      edge.instance.updateProps({
        ...props,
        id,
      });
    } else {
      console.error(`Update edge: edge with id ${id} does not exist.`);
    }
  }

  /**
   * Update an edge with newProps by ID. This allows you to update the
   * appearance of the edge, the source or target nodes, or the array of
   * coordinate points the edge passes through.
   *
   * @param id The ID of the edge you wish to update.
   * @param [newProps] Optional newProps object.
   * @param [newProps.props] Props to visually change the edge.
   * @param [newProps.newNodes] Optional newNodes object.
   * @param [newProps.newNodes.source] The new source node for the edge.
   * @param [newProps.newNodes.target] The new target node for the edge.
   * @param [newProps.coords] New coordinate points the edge passes through.
   */
  /**
   * Update an edge's end nodes and coordinates. This does NOT append the edge
   * onto paper.
   *
   * Order of operations:
   *
   * 1. If newNodes is given, update any provided edge endpoint nodes.
   *
   * 2. If coords is given, update edge coords array.
   *
   * 3. Get source and target nodes and find their midpoints.
   *
   * 4. Use the node intersection formula to find the actual start & end points.
   *
   * 5. Call updatePath on the edge instance with the new points.
   *
   * @param id The ID of the node to update coordinates.
   * @param newCoords The new coordinates of the node.
   */
  public updateEdgePosition(
    id: string,
    newNodes?: { source?: { id: string }; target?: { id: string } },
    coords?: ICoordinates[],
  ) {
    if (this._edges.hasOwnProperty(id)) {
      const edge = this._edges[id];

      if (newNodes) {
        edge.source.id = newNodes.source ? newNodes.source.id : edge.source.id;
        edge.target.id = newNodes.target ? newNodes.target.id : edge.target.id;
      }

      if (coords) {
        edge.coords = coords;
      }

      const sourceNode = this._nodes[edge.source.id];
      const targetNode = this._nodes[edge.target.id];

      const sourceMidPoint = getNodeMidpoint(sourceNode, this._gridSize);
      const targetMidPoint = getNodeMidpoint(targetNode, this._gridSize);

      // Get sourceNode intersection.
      const startPoint = getEdgeNodeIntersection(
        sourceMidPoint,
        edge.coords[0] || targetMidPoint,
        sourceNode,
      );

      // Get targetNode intersection.
      const endPoint = getEdgeNodeIntersection(
        targetMidPoint,
        edge.coords[edge.coords.length - 1] || sourceMidPoint,
        targetNode,
      );

      edge.instance.updatePath(startPoint, endPoint, edge.coords);
    } else {
      console.error(`Update edge position: edge with id ${id} does not exist.`);
    }
  }

  /**
   * Removes an edge from the paper by edge ID.
   *
   * @param id The ID of the edge you wish to remove.
   */
  public removeEdge(id: string): void {
    if (this._edges.hasOwnProperty(id)) {
      this._edges[id].ref.remove();
      delete this._edges[id];
    } else {
      console.error(`Delete edge: edge with id ${id} does not exist.`);
    }
  }

  /**
   * Updates the current active item if an active item is given, or removes any
   * active items if no parameters are given. You must provide an Active Item
   * object with the workflow item type, id of the item, and the state you wish
   * to move the item to.
   *
   * @param [activeItem] Optional active item object.
   */
  public updateActiveItem(activeItem?: IActiveItem): void {
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
          // TODO: Fix issue #2 - Right-click while moving hits error condition.
          //
          // Options:
          // 1. Handle right clicks seperately.
          // 2. Don't worry about it, and hide this specific error condition.
          //
          // https://github.com/liamross/workflow/issues/2
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
    this._activeItem = activeItem || null;

    if (activeItem) {
      // TODO: Do any 'initialization' actions on the new active item.
    }
  }

  private _handleMouseDown = (evt: MouseEvent): void => {
    const containerElement = (evt.target as Element).parentElement;
    const workflowType = getWorkflowType(containerElement);

    if (containerElement) {
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
    }
  };

  private _handleNodeMouseDown = (evt: MouseEvent, id: string): void => {
    if (this._nodes.hasOwnProperty(id)) {
      const node = this._nodes[id];

      // Set clicked node as moving item.
      this.updateActiveItem({
        id,
        paperItemState: PaperItemState.Moving,
        workflowType: WorkflowType.Node,
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
      this._activeItem.paperItemState === PaperItemState.Moving &&
      this._initialMouseCoords &&
      this._initialPaperCoords
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

      // TODO: Check if dragged block is overlapping.

      this.updateNodePosition(id, { x: blockX, y: blockY });
    } else {
      console.error(
        `Handle node mousemove: no current moving node. Active item: `,
        this._activeItem,
      );
    }
  };

  private _handleNodeMouseUp = (): void => {
    if (
      this._activeItem &&
      this._activeItem.workflowType === WorkflowType.Node &&
      this._activeItem.paperItemState === PaperItemState.Moving
    ) {
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

  private _handleEdgeMouseUp = (): void => {
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
