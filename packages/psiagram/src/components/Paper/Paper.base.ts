/**
 * Copyright (c) 2017-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  IPaperStoredNode,
  INodeComponentMap,
  IPaperStoredEdge,
  IEdgeComponentMap,
  IActiveItem,
  IPaperProperties,
  IPaperInputNode,
  PaperNode,
  IPaperInputEdge,
  edgeEndPoint,
  PaperEdge,
  PaperEventType,
} from './Paper.types';
import { PaperEvent } from '../PaperEvent';
import {
  generateRandomString,
  roundToNearest,
  createSVGWithAttributes,
  setElementType,
  ElementType,
  createElementWithAttributes,
  setSVGAttribute,
  getNodeMidpoint,
  getEdgeNodeIntersection,
  areCoordsEqual,
} from '../../utilities';
import { PaperError } from '../PaperError';
import { ICoordinates } from '../../common';

export class Paper {
  private _width: number;
  private _height: number;
  private _nodes: { [key: string]: IPaperStoredNode };
  private _nodeComponentMap: INodeComponentMap | null;
  private _edges: { [key: string]: IPaperStoredEdge };
  private _edgeComponentMap: IEdgeComponentMap | null;
  private _activeItem: IActiveItem | null;
  private _listeners: { [key: string]: Array<(evt: PaperEvent<any>) => void> };
  private _gridSize: number;
  private _uniqueId: string;
  private _paper: SVGElement;
  private _paperWrapper: HTMLElement;
  private _defs: SVGElement;

  constructor({ width, height, plugins, attributes, initialConditions }: IPaperProperties) {
    attributes = attributes || {};
    this._gridSize = attributes.gridSize || 0;
    this._uniqueId = attributes.uniqueId || generateRandomString(4);
    const paperWrapperClass: string = attributes.paperWrapperClass || '';
    const paperClass: string = attributes.paperClass || '';

    this._width = roundToNearest(width, this._gridSize, this._gridSize);
    this._height = roundToNearest(height, this._gridSize, this._gridSize);
    this._nodes = {};
    this._edges = {};
    this._activeItem = null;
    this._listeners = {};

    const paperWrapperId = `paper-wrapper_${this._uniqueId}`;
    const paperId = `paper_${this._uniqueId}`;

    // Set up paper.
    this._paper = createSVGWithAttributes('svg', {
      id: paperId,
      width: '100%',
      height: '100%',
      class: paperClass || null,
    });

    const defs = createSVGWithAttributes('defs');
    this._paper.appendChild(defs);
    this._defs = defs;

    setElementType(this._paper, ElementType.Paper);

    // Set up paper wrapper.
    this._paperWrapper = createElementWithAttributes('div', {
      class: paperWrapperClass || null,
      id: paperWrapperId,
      style: `width:${this._width}px; height:${this._height}px`,
    });
    this._paperWrapper.appendChild(this._paper);

    // Initialize all plugins.
    if (plugins) {
      plugins.forEach(plugin => {
        if (plugin.initialize) {
          plugin.initialize(
            this,
            {
              width: this._width,
              height: this._height,
              plugins,
              attributes: {
                gridSize: this._gridSize,
                paperWrapperClass,
                paperClass,
                uniqueId: this._uniqueId,
              },
              initialConditions,
            },
            this._nodes,
            this._edges,
          );
        }
      });
    }

    // Add all initial nodes and mappings.
    this._nodeComponentMap = null;
    if (initialConditions && initialConditions.nodes) {
      const allNodesMapped =
        initialConditions.nodeComponentMap &&
        initialConditions.nodes.every(
          node => node.component in (initialConditions.nodeComponentMap as INodeComponentMap),
        );

      if (!allNodesMapped) {
        throw new PaperError(
          'E_NODE_MAP',
          `Not all node.component strings exist in the nodeComponentMap.`,
          'Paper.base.ts',
          'constructor',
        );
      }

      this._nodeComponentMap = initialConditions.nodeComponentMap as INodeComponentMap;
      initialConditions.nodes.forEach(node => this.addNode(node));
    }

    // Add all initial edges and mappings.
    this._edgeComponentMap = null;
    if (initialConditions && initialConditions.edges) {
      const allEdgesMapped =
        initialConditions.edgeComponentMap &&
        initialConditions.edges.every(
          edge => edge.component in (initialConditions.edgeComponentMap as IEdgeComponentMap),
        );

      if (!allEdgesMapped) {
        throw new PaperError(
          'E_NODE_MAP',
          `Not all edge.component strings exist in the edgeComponentMap.`,
          'Paper.base.ts',
          'constructor',
        );
      }

      this._edgeComponentMap = initialConditions.edgeComponentMap as IEdgeComponentMap;
      initialConditions.edges.forEach(edge => this.addEdge(edge));
    }

    // Fire paper init event.
    this._fireEvent(new PaperEvent<PaperEventType.PaperInit>(PaperEventType.PaperInit, this));
  }

  /**
   * Returns the Paper wrapper which contains an svg Paper element, as well as
   * any nodes or edges rendered onto the Paper.
   */
  public getPaperElement(): HTMLElement {
    return this._paperWrapper;
  }

  /**
   * Add a Node to the Paper.
   *
   * @param node The Node to add to Paper.
   */
  public addNode(node: IPaperInputNode): void {
    if (this._nodes.hasOwnProperty(node.id)) {
      throw new PaperError('E_DUP_ID', `Node with id ${node.id} already exists.`, 'Paper.base.ts', 'addNode');
    } else {
      const nodeComponent = (this._nodeComponentMap as INodeComponentMap)[node.component];
      const instance = new nodeComponent({
        ...node.properties,
        id: node.id,
        gridSize: this._gridSize,
        uniqueId: this._uniqueId,
        paper: this,
      });
      instance.initialize();

      // Set proxies to allow direct get and set coordinates on each Node, while
      // still having it trigger within the Paper (where coords are stored).
      Object.defineProperties(instance, {
        coords: {
          get: () => this._getNodeCoords(node.id),
          set: (coords: ICoordinates) => this._setNodeCoords(node.id, coords),
          configurable: true,
        },
      });

      const newNode: IPaperStoredNode = {
        id: node.id,
        coords: node.coords,
        instance: (instance as unknown) as PaperNode,
      };

      const roundedX = roundToNearest(node.coords.x, this._gridSize);
      const roundedY = roundToNearest(node.coords.y, this._gridSize);

      this._fireEvent(
        new PaperEvent<PaperEventType.AddNode>(PaperEventType.AddNode, this, {
          target: newNode,
          data: { x: roundedX, y: roundedY },
          defaultAction: data => {
            this._nodes[node.id] = newNode;
            const ref = this._nodes[node.id].instance.getElement();
            if (ref) {
              setSVGAttribute(ref, 'transform', `translate(${data.x} ${data.y})`);
              this._paper.appendChild(ref);
            } else {
              throw new PaperError('E_INV_ELEM', 'Invalid element returned from Node', 'Paper.base.ts', 'addNode');
            }
          },
        }),
      );
    }
  }

  /**
   * Get a Node by ID. Use this to retrieve a Node and set any properties.
   *
   * @param id The ID of the Node.
   */
  public getNode(id: string): PaperNode {
    if (this._nodes.hasOwnProperty(id)) {
      return this._nodes[id].instance;
    } else {
      throw new PaperError('E_NO_ID', `Node with id ${id} does not exist.`, 'Paper.base.ts', 'getNode');
    }
  }

  /**
   * Removes a Node from the paper by Node ID.
   *
   * @param id The ID of the Node.
   */
  public removeNode(id: string): void {
    if (this._nodes.hasOwnProperty(id)) {
      this._fireEvent(
        new PaperEvent<PaperEventType.RemoveNode>(PaperEventType.RemoveNode, this, {
          target: this._nodes[id],
          defaultAction: () => {
            this._nodes[id].instance.teardown();

            // Remove all edges that use node as end point.
            Object.keys(this._edges).forEach(edgeId => {
              const edge = this._edges[edgeId];
              if (
                (edge.source.hasOwnProperty('id') && (edge.source as { id: string }).id === id) ||
                (edge.target.hasOwnProperty('id') && (edge.target as { id: string }).id === id)
              ) {
                this.removeEdge(edgeId);
              }
            });

            this._nodes[id].instance.getElement().remove();
            delete this._nodes[id];
          },
        }),
      );
    } else {
      throw new PaperError('E_NO_ID', `Node with id ${id} does not exist.`, 'Paper.base.ts', 'removeNode');
    }
  }

  /**
   * Add an Edge to the Paper.
   *
   * @param edge The Edge to add to Paper.
   */
  public addEdge(edge: IPaperInputEdge): void {
    if (this._edges.hasOwnProperty(edge.id)) {
      throw new PaperError('E_DUP_ID', `Edge with id ${edge.id} already exists.`, 'Paper.base.ts', 'addEdge');
    } else {
      const edgeComponent = (this._edgeComponentMap as IEdgeComponentMap)[edge.component];
      const instance = new edgeComponent({
        ...edge.properties,
        id: edge.id,
        gridSize: this._gridSize,
        uniqueId: this._uniqueId,
        paper: this,
      });
      instance.initialize();

      // Set proxies to allow direct get and set for source, target, and
      // coordinates on each Edge, while still having it trigger within the
      // Paper (where source, target and coords are stored).
      Object.defineProperties(instance, {
        source: {
          get: () => this._getEdgeSource(edge.id),
          set: (source: edgeEndPoint) => this._setEdgeSource(edge.id, source),
          configurable: true,
        },
        target: {
          get: () => this._getEdgeTarget(edge.id),
          set: (target: edgeEndPoint) => this._setEdgeTarget(edge.id, target),
          configurable: true,
        },
        coords: {
          get: () => this._getEdgeCoords(edge.id),
          set: (coords: ICoordinates[]) => this._setEdgeCoords(edge.id, coords),
          configurable: true,
        },
      });

      const ref = instance.getElement();

      const hasValidSource = edge.source.hasOwnProperty('id')
        ? this._nodes[(edge.source as { id: string }).id]
        : edge.source.hasOwnProperty('x');

      const hasValidTarget = edge.target.hasOwnProperty('id')
        ? this._nodes[(edge.target as { id: string }).id]
        : edge.target.hasOwnProperty('x');

      if (ref && hasValidSource && hasValidTarget) {
        const newEdge: IPaperStoredEdge = {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          coords: edge.coords,
          instance: (instance as unknown) as PaperEdge,
        };

        this._fireEvent(
          new PaperEvent<PaperEventType.AddEdge>(PaperEventType.AddEdge, this, {
            target: newEdge,
            defaultAction: () => {
              this._edges[edge.id] = newEdge;
              this._updateEdgeRoute(edge.id);
              this._paper.insertBefore(ref, this._defs.nextSibling);
            },
          }),
        );
      } else {
        throw new PaperError('E_INV_ELEM', 'Invalid element returned from edge', 'Paper.base.ts', 'addEdge');
      }
    }
  }

  /**
   * Get an Edge by ID. Use this to retrieve an Edge and set any properties.
   *
   * @param id The ID of the Edge.
   */
  public getEdge(id: string): PaperEdge {
    if (this._edges.hasOwnProperty(id)) {
      return this._edges[id].instance;
    } else {
      throw new PaperError('E_NO_ID', `Edge with id ${id} does not exist.`, 'Paper.base.ts', 'getEdge');
    }
  }

  /**
   * Removes an edge from the paper by edge ID.
   *
   * @param id The ID of the edge you wish to remove.
   */
  public removeEdge(id: string): void {
    if (this._edges.hasOwnProperty(id)) {
      this._fireEvent(
        new PaperEvent<PaperEventType.RemoveEdge>(PaperEventType.RemoveEdge, this, {
          target: this._edges[id],
          defaultAction: () => {
            this._edges[id].instance.teardown();
            this._edges[id].instance.getElement().remove();
            delete this._edges[id];
          },
        }),
      );
    } else {
      throw new PaperError('E_NO_ID', `Edge with id ${id} does not exist.`, 'Paper.base.ts', 'removeEdge');
    }
  }

  /**
   * Returns the current active item object, or null if there is no active item.
   */
  public getActiveItem(): IActiveItem | null {
    return this._activeItem;
  }

  /**
   * Updates the current active item if an active item is given, or removes any
   * active items if no parameters are given. You must provide an Active Item
   * object with the workflow item type, id of the item, and the state you wish
   * to move the item to.
   *
   * @param [activeItem] Optional. Active item object.
   */
  public updateActiveItem(activeItem?: IActiveItem): void {
    const oldActiveItem = this._activeItem;
    if (activeItem == null && oldActiveItem === null) {
      return;
    }
    const activeOrNull = activeItem || null;
    this._fireEvent(
      new PaperEvent<PaperEventType.UpdateActiveItem>(PaperEventType.UpdateActiveItem, this, {
        target: activeOrNull,
        data: { activeItem: activeOrNull, oldActiveItem },
        defaultAction: data => {
          this._activeItem = data.activeItem;
        },
      }),
    );
  }

  /**
   * Add a listener for a specific type of event. This listener will be called
   * every time the event is triggered.
   *
   * @param type The type of listener to add.
   * @param listener The listener function triggered when type of event happens.
   */
  public addListener(type: PaperEventType, listener: (evt: PaperEvent<any>) => void): void {
    if (this._listeners[type] === undefined) {
      this._listeners[type] = [];
    }

    if (this._listeners[type].every(currentLis => currentLis !== listener)) {
      this._listeners[type].push(listener);
    }
  }

  /**
   * Remove an added listener by type and listener function.
   *
   * @param type The type of listener to remove.
   * @param listener The listener function to remove.
   */
  public removeListener(type: PaperEventType, listener: (evt: PaperEvent<any>) => void): void {
    if (this._listeners[type] !== undefined && this._listeners[type].length) {
      const listenerIndex = this._listeners[type].findIndex(currentLis => currentLis === listener);
      this._listeners[type].splice(listenerIndex, 1);
    }
  }

  /**
   * **WARNING:** The underscore "_" denotes that this method should only be
   * used in plugins. Non-underscore methods should cover all other use cases.
   *
   * Fires an event, calling all listeners for that event type.
   *
   * Order of operations:
   * 1. If listeners of evt.eventType exist begins looping through listeners.
   * 2. Calls each listener with event if evt.canPropagate is true.
   * 3. After all listeners called, calls evt.defaultAction. If defaultAction
   *    has already been called by a listener, this does nothing.
   *
   * @param evt The event you wish to fire.
   */
  public _fireEvent(evt: PaperEvent<any>): void {
    if (Array.isArray(this._listeners[evt.eventType])) {
      this._listeners[evt.eventType].forEach(listener => {
        // We are going to do a bad thing here and check a private property.
        // Eventually we may move all of the event firing logic into the actual
        // event, but for now, we need to see if it can still propagate without
        // opening up _canPropagate to public use.
        // @ts-ignore
        if (evt._canPropagate) listener(evt);
      });
    }
    evt.defaultAction();
  }

  /**
   * **WARNING:** The underscore "_" denotes that this method should only be
   * used in plugins. Non-underscore methods should cover all other use cases.
   *
   * If you are trying to get the paper to render in your application, you
   * probably want to use getPaperElement().
   *
   * Returns the SVG element contained within the paper wrapper.
   */
  public _getDrawSurface(): SVGElement {
    return this._paper;
  }

  /**
   * **WARNING:** The underscore "_" denotes that this method should only be
   * used in plugins. Non-underscore methods should cover all other use cases.
   *
   * Insert a new def into the defs element within Paper.
   *
   * @param def The def to insert.
   * @param [id] Optional. An ID that can be used to remove the def.
   */
  public _insertPaperDef(def: SVGElement, id: string = ''): void {
    if (id) def.setAttribute('data-defs-id', id);
    this._defs.appendChild(def);
  }

  /**
   * **WARNING:** The underscore "_" denotes that this method should only be
   * used in plugins. Non-underscore methods should cover all other use cases.
   *
   * Remove a def from the defs element within Paper.
   *
   * @param id The ID of the def to remove.
   */
  public _removePaperDef(id: string): void {
    const childDefs = this._defs.children;
    for (let i = childDefs.length - 1; i >= 0; i--) {
      const def = childDefs[i];
      if (id === def.getAttribute('data-defs-id')) this._defs.removeChild(def);
    }
  }

  /**
   * Update the path of an Edge.
   *
   * @param id The ID of the Edge.
   * @private
   */
  private _updateEdgeRoute(id: string) {
    if (this._edges.hasOwnProperty(id)) {
      const edge = this._edges[id];

      let sourcePoint: ICoordinates | null = null;
      let targetPoint: ICoordinates | null = null;

      let sourceNode: IPaperStoredNode | null = null;
      let targetNode: IPaperStoredNode | null = null;

      if (edge.source.hasOwnProperty('id')) {
        const source = edge.source as { id: string };
        sourceNode = this._nodes[source.id];
      } else {
        const source = edge.source as ICoordinates;
        sourcePoint = {
          x: roundToNearest(source.x, this._gridSize),
          y: roundToNearest(source.y, this._gridSize),
        };
      }

      if (edge.target.hasOwnProperty('id')) {
        const target = edge.target as { id: string };
        targetNode = this._nodes[target.id];
      } else {
        const target = edge.target as ICoordinates;
        targetPoint = {
          x: roundToNearest(target.x, this._gridSize),
          y: roundToNearest(target.y, this._gridSize),
        };
      }

      if ((sourcePoint || sourceNode) && (targetPoint || targetNode)) {
        let sourceMidPoint: ICoordinates | null = null;
        let targetMidPoint: ICoordinates | null = null;

        if (sourceNode) {
          sourceMidPoint = getNodeMidpoint(sourceNode, this._gridSize);
        }
        if (targetNode) {
          targetMidPoint = getNodeMidpoint(targetNode, this._gridSize);
        }

        this._fireEvent(
          new PaperEvent<PaperEventType.MoveEdge>(PaperEventType.MoveEdge, this, {
            target: edge,
            data: {
              source: {
                node: sourceNode,
                midpoint: sourceMidPoint,
                point: sourcePoint,
              },
              target: {
                node: targetNode,
                midpoint: targetMidPoint,
                point: targetPoint,
              },
              coords: edge.coords,
            },
            defaultAction: ({ source, target, coords }) => {
              if (source.node) {
                source.point = getEdgeNodeIntersection(
                  source.node,
                  coords[0] || target.midpoint || target.point,
                  this._gridSize,
                );
              }
              if (target.node) {
                target.point = getEdgeNodeIntersection(
                  target.node,
                  coords[coords.length - 1] || source.midpoint || source.point,
                  this._gridSize,
                  4,
                );
              }

              edge.instance.setCoordinates([
                source.point as ICoordinates,
                ...coords.map(coordinate => ({
                  x: roundToNearest(coordinate.x, this._gridSize),
                  y: roundToNearest(coordinate.y, this._gridSize),
                })),
                target.point as ICoordinates,
              ]);
            },
          }),
        );
      } else {
        throw new PaperError(
          'E_NO_ID',
          'Node with Edge source or target Node ID does not exist.',
          'Paper.base.ts',
          'updateEdgeRoute',
        );
      }
    } else {
      throw new PaperError('E_NO_ID', `Edge with id ${id} does not exist.`, 'Paper.base.ts', 'updateEdgeRoute');
    }
  }

  /**
   * Returns the coordinates of a Node.
   *
   * @param id The ID of the Node.
   * @private
   */
  private _getNodeCoords = (id: string): ICoordinates => {
    if (this._nodes.hasOwnProperty(id)) {
      return this._nodes[id].coords;
    } else {
      throw new PaperError('E_NO_ID', `Node with id ${id} does not exist.`, 'Paper.base.ts', '_getNodeCoords');
    }
  };

  /**
   * Update coordinates of a Node. This does NOT append the Node onto paper.
   *
   * Order of operations:
   * 1. Updates the stored node coordinates.
   * 2. Updates a node position on the paper to provided coordinates.
   * 3. Update edge position on every edge that connects to the node.
   *
   * @param id The ID of the node.
   * @param newCoords The new coordinates of the node.
   * @private
   */
  private _setNodeCoords = (id: string, newCoords: ICoordinates): void => {
    if (this._nodes.hasOwnProperty(id)) {
      const node = this._nodes[id];

      // Only update node position if coordinates have changed.
      if (!areCoordsEqual(node.coords, newCoords)) {
        const oldCoords = { ...node.coords };

        this._fireEvent(
          new PaperEvent<PaperEventType.MoveNode>(PaperEventType.MoveNode, this, {
            target: node,
            data: { coords: newCoords, oldCoords },
            defaultAction: data => {
              node.coords = data.coords;

              setSVGAttribute(node.instance.getElement(), 'transform', `translate(${node.coords.x} ${node.coords.y})`);

              Object.keys(this._edges).forEach(edgeId => {
                const edge = this._edges[edgeId];
                if (
                  (edge.source.hasOwnProperty('id') && (edge.source as { id: string }).id === id) ||
                  (edge.target.hasOwnProperty('id') && (edge.target as { id: string }).id === id)
                ) {
                  this._updateEdgeRoute(edgeId);
                }
              });
            },
          }),
        );
      }
    } else {
      throw new PaperError('E_NO_ID', `Node with id ${id} does not exist.`, 'Paper.base.ts', '_setNodeCoords');
    }
  };

  /**
   * Returns the source of an Edge.
   *
   * @param id The ID of the Edge.
   * @private
   */
  private _getEdgeSource = (id: string): edgeEndPoint => {
    if (this._edges.hasOwnProperty(id)) {
      return this._edges[id].source;
    } else {
      throw new PaperError('E_NO_ID', `Edge with id ${id} does not exist.`, 'Paper.base.ts', '_getEdgeSource');
    }
  };

  /**
   * Sets the source of an Edge, and makes update call to Edge.
   *
   * @param id The ID of the Edge.
   * @param newSource The new source of the Edge.
   * @private
   */
  private _setEdgeSource = (id: string, newSource: edgeEndPoint): void => {
    if (this._edges.hasOwnProperty(id)) {
      this._edges[id].source = newSource;
      this._updateEdgeRoute(id);
    } else {
      throw new PaperError('E_NO_ID', `Edge with id ${id} does not exist.`, 'Paper.base.ts', '_setEdgeSource');
    }
  };

  /**
   * Returns the target of an Edge.
   *
   * @param id The ID of the Edge.
   * @private
   */
  private _getEdgeTarget = (id: string): edgeEndPoint => {
    if (this._edges.hasOwnProperty(id)) {
      return this._edges[id].target;
    } else {
      throw new PaperError('E_NO_ID', `Edge with id ${id} does not exist.`, 'Paper.base.ts', '_getEdgeTarget');
    }
  };

  /**
   * Sets the target of an Edge, and makes update call to Edge.
   *
   * @param id The ID of the Edge.
   * @param newTarget The new target of the Edge.
   * @private
   */
  private _setEdgeTarget = (id: string, newTarget: edgeEndPoint): void => {
    if (this._edges.hasOwnProperty(id)) {
      this._edges[id].target = newTarget;
      this._updateEdgeRoute(id);
    } else {
      throw new PaperError('E_NO_ID', `Edge with id ${id} does not exist.`, 'Paper.base.ts', '_setEdgeTarget');
    }
  };

  /**
   * Returns the coords of an Edge.
   *
   * @param id The ID of the Edge.
   * @private
   */
  private _getEdgeCoords = (id: string): ICoordinates[] => {
    if (this._edges.hasOwnProperty(id)) {
      return this._edges[id].coords;
    } else {
      throw new PaperError('E_NO_ID', `Edge with id ${id} does not exist.`, 'Paper.base.ts', '_getEdgeCoords');
    }
  };

  /**
   * Sets the coords of an Edge, and makes update call to Edge.
   *
   * @param id The ID of the Edge.
   * @param newCoords The new coords of the Edge.
   * @private
   */
  private _setEdgeCoords = (id: string, newCoords: ICoordinates[]): void => {
    if (this._edges.hasOwnProperty(id)) {
      this._edges[id].coords = newCoords;
      this._updateEdgeRoute(id);
    } else {
      throw new PaperError('E_NO_ID', `Edge with id ${id} does not exist.`, 'Paper.base.ts', '_setEdgeCoords');
    }
  };
}
