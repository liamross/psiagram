/**
 * Copyright (c) 2017-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { setPaperDefs } from './helpers/svgDefinitions';

import {
  Node,
  Edge,
  PaperEvent,
  ICoordinates,
  IPaperProperties,
  IActiveItem,
  IPaperInputNode,
  IPaperStoredNode,
  IPaperInputEdge,
  IPaperStoredEdge,
  IPaperNodeUpdateProperties,
  IPaperEdgeUpdateProperties,
  paperEventType,
  listenerFunction,
  setWorkflowType,
  WorkflowType,
  createElementWithAttributes,
  createSVGWithAttributes,
  setSVGAttribute,
  roundToNearest,
  getNodeMidpoint,
  getEdgeNodeIntersection,
  areCoordsEqual,
  generateRandomString,
} from '../../';
import { IPluginProperties } from '../../common';

export class Paper {
  private _width: number;
  private _height: number;
  private _nodes: { [key: string]: IPaperStoredNode };
  private _edges: { [key: string]: IPaperStoredEdge };
  private _activeItem: IActiveItem | null;
  private _listeners: { [key: string]: listenerFunction[] };
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
  }: IPaperProperties) {
    attributes = attributes || {};
    this._gridSize = attributes.gridSize || 0;
    this._allowBlockOverlap = attributes.allowBlockOverlap || false;
    const gridColor: string = attributes.gridColor || '#EEE';
    const paperWrapperClass: string = attributes.paperWrapperClass || '';
    const paperClass: string = attributes.paperClass || '';

    this._width = roundToNearest(width, this._gridSize, this._gridSize);
    this._height = roundToNearest(height, this._gridSize, this._gridSize);
    this._nodes = {};
    this._edges = {};
    this._activeItem = null;
    this._listeners = {};

    // Generate base36 IDs that are 4 characters long.
    const randomId = generateRandomString(36, 4);
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
      style: `width:${this._width}px; height:${this._height}px`,
    });
    this._paperWrapper.appendChild(this._paper);

    // Add all initial nodes.
    if (initialConditions && initialConditions.nodes) {
      initialConditions.nodes.forEach(node => this.addNode(node));
    }

    // Add all initial edges.
    if (initialConditions && initialConditions.edges) {
      initialConditions.edges.forEach(edge => this.addEdge(edge));
    }

    // Initialize all plugins.
    if (plugins) {
      plugins.forEach(plugin => {
        if (plugin.initialize) {
          plugin.initialize(this, this._nodes, this._edges, {
            width: this._width,
            height: this._height,
            plugins,
            attributes: {
              gridSize: this._gridSize,
              allowBlockOverlap: this._allowBlockOverlap,
              gridColor,
              paperWrapperClass,
              paperClass,
            },
            initialConditions,
          });
        }
      });
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
   * Add a listener for a specific type of event. This listener will be called
   * every time the event is triggered.
   *
   * @param type The type of listener to add.
   * @param listener The listener function triggered when type of event happens.
   */
  public addListener(type: paperEventType, listener: listenerFunction): void {
    if (this._listeners[type] === undefined) {
      this._listeners[type] = [];
    }

    if (this._listeners[type].every(currentLis => currentLis !== listener)) {
      this._listeners[type].push(listener);
    } else {
      console.error(
        `Add listener: identical listener already exists for "${type}".`,
      );
    }
  }

  /**
   * Add a listener for a specific type of event. This listener will be called
   * every time the event is triggered.
   *
   * @param type The type of listener to remove.
   * @param listener The listener function to remove.
   */
  public removeListener(
    type: paperEventType,
    listener: listenerFunction,
  ): void {
    if (this._listeners[type] !== undefined && this._listeners[type].length) {
      const listenerIndex = this._listeners[type].findIndex(
        currentLis => currentLis === listener,
      );
      this._listeners[type].splice(listenerIndex, 1);
    }
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
        ...node.properties,
        gridSize: this._gridSize,
        id: node.id,
      });

      // Get params and ref to element from instance.
      const params = instance.getParameters();
      const ref = instance.getNodeElement();

      // Create new node.
      const newNode = {
        coords: node.coords,
        id: node.id,
        instance,
        params,
        ref,
      };

      // Round node coords to nearest grid.
      const roundedX = roundToNearest(node.coords.x, this._gridSize);
      const roundedY = roundToNearest(node.coords.y, this._gridSize);

      const evt = new PaperEvent('add-node', {
        paper: this,
        target: newNode,
        data: { roundedX, roundedY },
        defaultAction: () => {
          // Add node to nodes.
          this._nodes[node.id] = newNode;

          // If ref, translate to node.coords and append onto paper.
          if (ref) {
            setSVGAttribute(
              ref,
              'transform',
              `translate(${roundedX} ${roundedY})`,
            );

            this._paper.appendChild(ref);
          } else {
            console.error(
              `Add node: invalid element returned from node class\nNode ID: ${
                this._nodes[node.id].id
              }`,
            );
          }
        },
      });

      this._fireEvent(evt);
    }
  }

  /**
   * Update the appearance of the node with given ID.
   *
   * @param id The ID of the node you wish to update.
   * @param properties Properties to visually change the node.
   */
  public updateNodeProperties(
    id: string,
    properties: IPaperNodeUpdateProperties,
  ): void {
    if (this._nodes.hasOwnProperty(id)) {
      const node = this._nodes[id];

      const evt = new PaperEvent('update-node', {
        paper: this,
        target: node,
        data: { properties },
        defaultAction: () => {
          node.instance.updateProperties({
            ...properties,
            gridSize: this._gridSize,
            id,
          });
        },
      });

      this._fireEvent(evt);
    } else {
      console.error(
        `Update node properties: node with id ${id} does not exist.`,
      );
    }
  }

  /**
   * Update a nodes coordinates. This does NOT append the node onto paper.
   *
   * Order of operations:
   * 1. Updates the stored node coordinates.
   * 2. Updates a node position on the paper to provided coordinates.
   * 3. Update edge position on every edge that connects to the node.
   *
   * @param id The ID of the node to update coordinates.
   * @param newCoords The new coordinates of the node.
   */
  public moveNode(id: string, newCoords: ICoordinates): void {
    if (this._nodes.hasOwnProperty(id)) {
      const node = this._nodes[id];

      // Only update node position if coordinates have changed.
      if (!areCoordsEqual(node.coords, newCoords)) {
        const oldCoords = { ...node.coords };

        const evt = new PaperEvent('move-node', {
          paper: this,
          target: node,
          data: { newCoords, oldCoords },
          defaultAction: () => {
            node.coords = newCoords;

            setSVGAttribute(
              node.ref,
              'transform',
              `translate(${node.coords.x} ${node.coords.y})`,
            );

            Object.keys(this._edges).forEach(edgeId => {
              const edge = this._edges[edgeId];
              if (edge.source.id === id || edge.target.id === id) {
                this.updateEdgeRoute(edgeId);
              }
            });
          },
        });

        this._fireEvent(evt);
      }
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
      const evt = new PaperEvent('remove-node', {
        paper: this,
        target: this._nodes[id],
        defaultAction: () => {
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
        },
      });

      this._fireEvent(evt);
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
        ...edge.properties,
        id: edge.id,
      });

      // Get ref to element from instance.
      const ref = instance.getEdgeElement();

      // Get actual nodes to ensure they exist.
      const sourceNode = this._nodes[edge.source.id];
      const targetNode = this._nodes[edge.target.id];

      // Add edge to edges.
      const newEdge = {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        coords: edge.coords,
        instance,
        ref,
      };

      // If ref, update edge position and append onto paper.
      if (ref && sourceNode && targetNode) {
        const evt = new PaperEvent('add-edge', {
          paper: this,
          target: newEdge,
          data: { sourceNode, targetNode },
          defaultAction: () => {
            this._edges[edge.id] = newEdge;

            this.updateEdgeRoute(edge.id);
            this._paper.appendChild(ref);
          },
        });

        this._fireEvent(evt);
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
   * @param properties Properties to visually change the edge.
   */
  public updateEdgeProperties(
    id: string,
    properties: IPaperEdgeUpdateProperties,
  ): void {
    if (this._edges.hasOwnProperty(id)) {
      const edge = this._edges[id];

      const evt = new PaperEvent('update-edge', {
        paper: this,
        target: edge,
        data: { properties },
        defaultAction: () => {
          edge.instance.updateProperties({
            ...properties,
            id,
          });
        },
      });

      this._fireEvent(evt);
    } else {
      console.error(`Update edge: edge with id ${id} does not exist.`);
    }
  }

  /**
   * Update an edge's end nodes and coordinates. This does NOT append the edge
   * onto paper.
   *
   * Order of operations:
   * 1. If newNodes is given, update any provided edge endpoint nodes.
   * 2. If coords is given, update edge coords array.
   * 3. Get source and target nodes and find their midpoints.
   * 4. Use the node intersection formula to find the actual start & end points.
   * 5. Call updatePath on the edge instance with the new points.
   *
   * @param id The ID of the node to update coordinates.
   * @param [coords] A new array of coordinates for the edge.
   * @param [newNodes] The new coordinates of the node.
   * @param [newNodes.source] A new source node for the edge.
   * @param [newNodes.target] A new target node for the edge.
   */
  public updateEdgeRoute(
    id: string,
    coords?: ICoordinates[],
    newNodes?: { source?: { id: string }; target?: { id: string } },
  ) {
    if (this._edges.hasOwnProperty(id)) {
      const edge = this._edges[id];

      if (coords) {
        edge.coords = coords;
      }

      if (newNodes) {
        edge.source.id = newNodes.source ? newNodes.source.id : edge.source.id;
        edge.target.id = newNodes.target ? newNodes.target.id : edge.target.id;
      }

      // TODO: case when source or target IDs do not point to anything. Maybe
      // check in add node and here? To prevent drawing onto paper.

      const sourceNode = this._nodes[edge.source.id];
      const targetNode = this._nodes[edge.target.id];

      if (sourceNode && targetNode) {
        const sourceMidPoint = getNodeMidpoint(sourceNode, this._gridSize);
        const targetMidPoint = getNodeMidpoint(targetNode, this._gridSize);

        // Get sourceNode intersection.
        const sourceIntersect = getEdgeNodeIntersection(
          sourceNode,
          edge.coords[0] || targetMidPoint,
          this._gridSize,
        );

        // Get targetNode intersection.
        const targetIntersect = getEdgeNodeIntersection(
          targetNode,
          edge.coords[edge.coords.length - 1] || sourceMidPoint,
          this._gridSize,
          4,
        );

        const evt = new PaperEvent('move-edge', {
          paper: this,
          target: edge,
          data: {
            nodes: { sourceNode, targetNode },
            midpoints: { sourceMidPoint, targetMidPoint },
            intersects: { sourceIntersect, targetIntersect },
          },
          defaultAction: () => {
            edge.instance.updatePath(
              sourceIntersect,
              targetIntersect,
              edge.coords,
            );
          },
        });

        this._fireEvent(evt);
      } else {
        console.error(
          `Update edge position: edge source or target id is not valid.`,
        );
      }
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
      const evt = new PaperEvent('remove-edge', {
        paper: this,
        target: this._edges[id],
        defaultAction: () => {
          this._edges[id].ref.remove();
          delete this._edges[id];
        },
      });

      this._fireEvent(evt);
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
      // If all keys are identical, exit function.
      if (
        activeItem &&
        Object.keys(activeItem).every(
          key => oldActiveItem[key] === activeItem[key],
        )
      ) {
        return;
      } else {
        // TODO: Do any 'exit' actions on oldActiveItem.
      }
    }

    // If both items are null or undefined, exit function.
    if (activeItem == null && oldActiveItem == null) {
      return;
    }

    const evt = new PaperEvent('update-active-item', {
      paper: this,
      target: activeItem || null,
      data: { oldActiveItem },
      defaultAction: () => {
        // Update active item.
        this._activeItem = activeItem || null;

        if (activeItem) {
          // TODO: Do any 'initialization' actions on the new active item.
        }
      },
    });

    this._fireEvent(evt);
  }

  /**
   * Returns the current active item object, or null if there is no active item.
   */
  public getActiveItem(): IActiveItem | null {
    return this._activeItem;
  }

  /**
   * WARNING: The underscore "_" denotes that this should be used in plugins.
   * Non-underscore methods should cover all other use cases.
   *
   * Calls all listeners of a specific paper event type.
   *
   * Order of operations:
   * 1. If listeners of evt.eventType exist begins looping through listeners.
   * 2. Calls each listener with event if evt.canPropagate is true.
   * 3. After all listeners called, calls evt.defaultAction. If defaultAction
   *    has already been called by a listener, this does nothing.
   *
   * @param evt The event originating from the paper.
   */
  public _fireEvent(evt: PaperEvent): void {
    const type = evt.eventType;

    if (this._listeners[type] !== undefined && this._listeners[type].length) {
      this._listeners[type].forEach(listener => {
        if (evt.canPropagate) {
          listener(evt);
        }
      });
    }

    evt.defaultAction();
  }

  /**
   * WARNING: The underscore "_" denotes that this should be used in plugins.
   * Non-underscore methods should cover all other use cases.
   *
   * If you are trying to get the paper to render in your application, you
   * probably want to use getPaperElement().
   *
   * Returns the SVG element contained within the paper wrapper.
   *
   * @returns {SVGElement} Returns the SVG Paper element.
   */
  public _getDrawSurface(): SVGElement {
    return this._paper;
  }
}
