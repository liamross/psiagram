/**
 * Copyright (c) 2017-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { setPaperDefs } from './setPaperDefs';
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
  paperEventType,
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
  private _listeners: { [key: string]: Array<(evt: PaperEvent) => void> };
  private _gridSize: number;
  private _uniqueId: string;
  private _paper: SVGElement;
  private _paperWrapper: HTMLElement;
  private _defs: SVGElement;

  constructor({
    width,
    height,
    plugins,
    attributes,
    initialConditions,
  }: IPaperProperties) {
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
    this._defs = setPaperDefs(this._paper, this._uniqueId);
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
          node =>
            node.component in
            (initialConditions.nodeComponentMap as INodeComponentMap),
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
          edge =>
            edge.component in
            (initialConditions.edgeComponentMap as IEdgeComponentMap),
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
    const evt = new PaperEvent('paper-init', { paper: this });
    this._fireEvent(evt);
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
      throw new PaperError(
        'E_DUP_ID',
        `Node with id ${node.id} already exists.`,
        'Paper.base.ts',
        'addNode',
      );
    } else {
      const nodeComponent = (this._nodeComponentMap as INodeComponentMap)[
        node.component
      ];
      const instance = new nodeComponent({
        ...node.properties,
        id: node.id,
        gridSize: this._gridSize,
      });
      instance.initialize();

      // Set proxies to allow direct get and set coordinates on each Node, while
      // still having it trigger within the Paper (where coords are stored).
      Object.defineProperties(instance, {
        _getNodeCoordsProxy: {
          value: this._getNodeCoords,
          configurable: true,
        },
        _setNodeCoordsProxy: {
          value: this._setNodeCoords,
          configurable: true,
        },
        coords: {
          get() {
            return this._getNodeCoordsProxy(this.props.id);
          },
          set(coords: ICoordinates) {
            this._setNodeCoordsProxy(this.props.id, coords);
          },
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

      const evt = new PaperEvent('add-node', {
        paper: this,
        target: newNode,
        data: { roundedX, roundedY },
        defaultAction: () => {
          this._nodes[node.id] = newNode;
          const ref = this._nodes[node.id].instance.getElement();

          if (ref) {
            setSVGAttribute(
              ref,
              'transform',
              `translate(${roundedX} ${roundedY})`,
            );

            this._paper.appendChild(ref);
          } else {
            throw new PaperError(
              'E_INV_ELEM',
              'Invalid element returned from Node',
              'Paper.base.ts',
              'addNode',
            );
          }
        },
      });

      this._fireEvent(evt);
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
      throw new PaperError(
        'E_NO_ID',
        `Node with id ${id} does not exist.`,
        'Paper.base.ts',
        'getNode',
      );
    }
  }

  /**
   * Removes a Node from the paper by Node ID.
   *
   * @param id The ID of the Node.
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
            if (
              (edge.source.hasOwnProperty('id') &&
                (edge.source as { id: string }).id === id) ||
              (edge.target.hasOwnProperty('id') &&
                (edge.target as { id: string }).id === id)
            ) {
              this.removeEdge(edgeId);
            }
          });

          // Remove node.
          this._nodes[id].instance.getElement().remove();
          delete this._nodes[id];
        },
      });

      this._fireEvent(evt);
    } else {
      throw new PaperError(
        'E_NO_ID',
        `Node with id ${id} does not exist.`,
        'Paper.base.ts',
        'removeNode',
      );
    }
  }

  /**
   * Add an Edge to the Paper.
   *
   * @param edge The Edge to add to Paper.
   */
  public addEdge(edge: IPaperInputEdge): void {
    if (this._edges.hasOwnProperty(edge.id)) {
      throw new PaperError(
        'E_DUP_ID',
        `Edge with id ${edge.id} already exists.`,
        'Paper.base.ts',
        'addEdge',
      );
    } else {
      const edgeComponent = (this._edgeComponentMap as IEdgeComponentMap)[
        edge.component
      ];
      const instance = new edgeComponent({
        ...edge.properties,
        id: edge.id,
        gridSize: this._gridSize,
        paperUniqueId: this._uniqueId,
      });
      instance.initialize();

      // Set proxies to allow direct get and set for source, target, and
      // coordinates on each Edge, while still having it trigger within the
      // Paper (where source, target and coords are stored).
      Object.defineProperties(instance, {
        _getEdgeSourceProxy: {
          value: this._getEdgeSource,
          configurable: true,
        },
        _setEdgeSourceProxy: {
          value: this._setEdgeSource,
          configurable: true,
        },
        _getEdgeTargetProxy: {
          value: this._getEdgeTarget,
          configurable: true,
        },
        _setEdgeTargetProxy: {
          value: this._setEdgeTarget,
          configurable: true,
        },
        _getEdgeCoordsProxy: {
          value: this._getEdgeCoords,
          configurable: true,
        },
        _setEdgeCoordsProxy: {
          value: this._setEdgeCoords,
          configurable: true,
        },
        source: {
          get() {
            return this._getEdgeSourceProxy(this.props.id);
          },
          set(source: edgeEndPoint) {
            this._setEdgeSourceProxy(this.props.id, source);
          },
          configurable: true,
        },
        target: {
          get() {
            return this._getEdgeTargetProxy(this.props.id);
          },
          set(target: edgeEndPoint) {
            this._setEdgeTargetProxy(this.props.id, target);
          },
          configurable: true,
        },
        coords: {
          get() {
            return this._getEdgeCoordsProxy(this.props.id);
          },
          set(coords: ICoordinates[]) {
            this._setEdgeCoordsProxy(this.props.id, coords);
          },
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

        const evt = new PaperEvent('add-edge', {
          paper: this,
          target: newEdge,
          defaultAction: () => {
            this._edges[edge.id] = newEdge;

            this._updateEdgeRoute(edge.id);
            this._paper.insertBefore(ref, this._paper.firstChild);
          },
        });

        this._fireEvent(evt);
      } else {
        throw new PaperError(
          'E_INV_ELEM',
          'Invalid element returned from edge',
          'Paper.base.ts',
          'addEdge',
        );
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
      throw new PaperError(
        'E_NO_ID',
        `Edge with id ${id} does not exist.`,
        'Paper.base.ts',
        'getEdge',
      );
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
          this._edges[id].instance.getElement().remove();
          delete this._edges[id];
        },
      });

      this._fireEvent(evt);
    } else {
      throw new PaperError(
        'E_NO_ID',
        `Edge with id ${id} does not exist.`,
        'Paper.base.ts',
        'removeEdge',
      );
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
   * Add a listener for a specific type of event. This listener will be called
   * every time the event is triggered.
   *
   * @param type The type of listener to add.
   * @param listener The listener function triggered when type of event happens.
   */
  public addListener(
    type: paperEventType,
    listener: (evt: PaperEvent) => void,
  ): void {
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
  public removeListener(
    type: paperEventType,
    listener: (evt: PaperEvent) => void,
  ): void {
    if (this._listeners[type] !== undefined && this._listeners[type].length) {
      const listenerIndex = this._listeners[type].findIndex(
        currentLis => currentLis === listener,
      );
      this._listeners[type].splice(listenerIndex, 1);
    }
  }

  /**
   * **WARNING:** The underscore "_" denotes that this method should only be
   * used in plugins. Non-underscore methods should cover all other use cases.
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

    if (Array.isArray(this._listeners[type]) && this._listeners[type].length) {
      this._listeners[type].forEach(listener => {
        if (evt.canPropagate) listener(evt);
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
   * @param [id] Optional. The ID of the def to remove.
   */
  public _removePaperDef(id: string): void {
    const childDefs = this._defs.children;
    for (let i = childDefs.length - 1; i >= 0; i--) {
      const def = childDefs[i];
      if (id === def.getAttribute('data-defs-id')) {
        this._defs.removeChild(def);
      }
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

        const evt = new PaperEvent('move-edge', {
          paper: this,
          target: edge,
          data: {
            nodes: { sourceNode, sourceMidPoint, targetNode, targetMidPoint },
            points: { sourcePoint, targetPoint },
          },
          defaultAction: () => {
            if (sourceNode) {
              sourcePoint = getEdgeNodeIntersection(
                sourceNode,
                edge.coords[0] || targetMidPoint || targetPoint,
                this._gridSize,
              );
            }
            if (targetNode) {
              targetPoint = getEdgeNodeIntersection(
                targetNode,
                edge.coords[edge.coords.length - 1] ||
                  sourceMidPoint ||
                  sourcePoint,
                this._gridSize,
                4,
              );
            }

            edge.instance.setCoordinates([
              sourcePoint as ICoordinates,
              ...edge.coords.map(coordinate => ({
                x: roundToNearest(coordinate.x, this._gridSize),
                y: roundToNearest(coordinate.y, this._gridSize),
              })),
              targetPoint as ICoordinates,
            ]);
          },
        });

        this._fireEvent(evt);
      } else {
        throw new PaperError(
          'E_NO_ID',
          'Node with Edge source or target Node ID does not exist.',
          'Paper.base.ts',
          'updateEdgeRoute',
        );
      }
    } else {
      throw new PaperError(
        'E_NO_ID',
        `Edge with id ${id} does not exist.`,
        'Paper.base.ts',
        'updateEdgeRoute',
      );
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
      throw new PaperError(
        'E_NO_ID',
        `Node with id ${id} does not exist.`,
        'Paper.base.ts',
        '_getNodeCoords',
      );
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

        const evt = new PaperEvent('move-node', {
          paper: this,
          target: node,
          data: { newCoords, oldCoords },
          defaultAction: () => {
            node.coords = newCoords;

            setSVGAttribute(
              node.instance.getElement(),
              'transform',
              `translate(${node.coords.x} ${node.coords.y})`,
            );

            Object.keys(this._edges).forEach(edgeId => {
              const edge = this._edges[edgeId];
              if (
                (edge.source.hasOwnProperty('id') &&
                  (edge.source as { id: string }).id === id) ||
                (edge.target.hasOwnProperty('id') &&
                  (edge.target as { id: string }).id === id)
              ) {
                this._updateEdgeRoute(edgeId);
              }
            });
          },
        });

        this._fireEvent(evt);
      }
    } else {
      throw new PaperError(
        'E_NO_ID',
        `Node with id ${id} does not exist.`,
        'Paper.base.ts',
        '_setNodeCoords',
      );
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
      throw new PaperError(
        'E_NO_ID',
        `Edge with id ${id} does not exist.`,
        'Paper.base.ts',
        '_getEdgeSource',
      );
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
      throw new PaperError(
        'E_NO_ID',
        `Edge with id ${id} does not exist.`,
        'Paper.base.ts',
        '_setEdgeSource',
      );
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
      throw new PaperError(
        'E_NO_ID',
        `Edge with id ${id} does not exist.`,
        'Paper.base.ts',
        '_getEdgeTarget',
      );
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
      throw new PaperError(
        'E_NO_ID',
        `Edge with id ${id} does not exist.`,
        'Paper.base.ts',
        '_setEdgeTarget',
      );
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
      throw new PaperError(
        'E_NO_ID',
        `Edge with id ${id} does not exist.`,
        'Paper.base.ts',
        '_getEdgeCoords',
      );
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
      throw new PaperError(
        'E_NO_ID',
        `Edge with id ${id} does not exist.`,
        'Paper.base.ts',
        '_setEdgeCoords',
      );
    }
  };
}
