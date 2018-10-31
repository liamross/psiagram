/**
 * Copyright (c) 2017-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  Paper,
  getElementType,
  ElementType,
  PaperItemState,
  roundToNearest,
  PsiagramPlugin,
  ICoordinates,
  IPaperStoredNode,
  IPaperStoredEdge,
  IPluginProperties,
  PaperError,
  distanceBetweenPoints,
} from 'psiagram';

export class MouseEvents implements PsiagramPlugin {
  private _paperInstance: Paper | null;
  private _paper: SVGElement | null;
  private _paperWrapper: HTMLElement | null;
  private _nodes: { [key: string]: IPaperStoredNode };
  private _edges: { [key: string]: IPaperStoredEdge };
  private _initialMouseCoords: ICoordinates | null;
  private _initialPaperCoords: ICoordinates | null;
  private _gridSize: number;

  constructor() {
    this._paperInstance = null;
    this._paperWrapper = null;
    this._paper = null;
    this._nodes = {};
    this._edges = {};
    this._initialMouseCoords = null;
    this._initialPaperCoords = null;
    this._gridSize = 0;
  }

  public initialize(
    paper: Paper,
    properties: IPluginProperties,
    nodes: { [key: string]: IPaperStoredNode },
    edges: { [key: string]: IPaperStoredEdge },
  ): void {
    this._paperInstance = paper;
    this._paperWrapper = this._paperInstance.getPaperElement();
    this._paper = this._paperInstance._getDrawSurface();

    this._nodes = nodes;
    this._edges = edges;
    this._initialMouseCoords = null;
    this._initialPaperCoords = null;
    this._gridSize = properties.attributes.gridSize;

    if (this._paperWrapper) {
      this._paperWrapper.addEventListener('mousedown', this._handleMouseDown);
    }
  }

  public teardown(): void {
    if (this._paperWrapper) {
      this._paperWrapper.removeEventListener(
        'mousedown',
        this._handleMouseDown,
      );
    }
  }

  private _handleMouseDown = (evt: MouseEvent): void => {
    const containerElement = (evt.target as Element).parentElement;
    const elementType = getElementType(containerElement);
    if (containerElement) {
      switch (elementType) {
        case ElementType.Node:
          this._handleNodeMouseDown(evt, containerElement.id);
          break;
        case ElementType.Edge:
          this._handleEdgeMouseDown(evt, containerElement.id);
          break;
        case ElementType.Paper:
          // Do we need to give ID?
          this._handlePaperMouseDown(evt, containerElement.id);
          break;
        default:
          break;
      }
    }
  };

  private _handleNodeMouseDown(evt: MouseEvent, id: string): void {
    if (this._nodes.hasOwnProperty(id) && this._paperInstance && this._paper) {
      const node = this._nodes[id];
      // Set clicked node as moving item.
      this._paperInstance.updateActiveItem({
        id,
        paperItemState: PaperItemState.Moving,
        elementType: ElementType.Node,
      });
      // Store initial mouse coordinates.
      this._initialMouseCoords = {
        x: evt.pageX,
        y: evt.pageY,
      };
      // Store original coordinates in paper (to nearest grid).
      this._initialPaperCoords = {
        x: roundToNearest(node.coords.x, this._gridSize),
        y: roundToNearest(node.coords.y, this._gridSize),
      };
      // Move node to top within paper.
      this._paper.appendChild(node.instance.getElement());
      // Initialize mouse movement and release listeners.
      document.addEventListener('mousemove', this._handleNodeMouseMove);
      document.addEventListener('mouseup', this._handleNodeMouseUp);
    } else {
      throw new PaperError(
        'E_NO_ID',
        `Node with id ${id} does not exist.`,
        'MouseEvents.ts',
        '_handleNodeMouseDown',
      );
    }
  }

  private _handleNodeMouseMove = (evt: MouseEvent): void => {
    const activeItem = this._paperInstance
      ? this._paperInstance.getActiveItem()
      : null;

    if (
      activeItem &&
      activeItem.elementType === ElementType.Node &&
      activeItem.paperItemState === PaperItemState.Moving &&
      this._initialMouseCoords &&
      this._initialPaperCoords &&
      this._paperInstance
    ) {
      const id = activeItem.id;
      // Find mouse deltas vs original coordinates.
      const mouseDeltaX = this._initialMouseCoords.x - evt.pageX;
      const mouseDeltaY = this._initialMouseCoords.y - evt.pageY;
      // Round mouse deltas to nearest grid.
      const roundedMouseDeltaX = roundToNearest(mouseDeltaX, this._gridSize);
      const roundedMouseDeltaY = roundToNearest(mouseDeltaY, this._gridSize);
      // Find new block coordinates.
      const blockX = this._initialPaperCoords.x - roundedMouseDeltaX;
      const blockY = this._initialPaperCoords.y - roundedMouseDeltaY;
      const node = this._paperInstance.getNode(id);
      node.coords = { x: blockX, y: blockY };
    } else {
      throw new PaperError(
        'E_INV_ACT',
        `No current moving node. Active item: ${JSON.stringify(activeItem)}`,
        'MouseEvents.ts',
        '_handleNodeMouseMove',
      );
    }
  };

  private _handleNodeMouseUp = (): void => {
    const activeItem = this._paperInstance
      ? this._paperInstance.getActiveItem()
      : null;

    if (
      activeItem &&
      activeItem.elementType === ElementType.Node &&
      activeItem.paperItemState === PaperItemState.Moving &&
      this._paperInstance
    ) {
      // Set active node to selected state.
      this._paperInstance.updateActiveItem({
        ...activeItem,
        paperItemState: PaperItemState.Selected,
      });
    } else {
      throw new PaperError(
        'E_INV_ACT',
        `No current moving node. Active item: ${JSON.stringify(activeItem)}`,
        'MouseEvents.ts',
        '_handleNodeMouseUp',
      );
    }
    // Remove listeners and reset coordinates.
    this._resetMouseListeners();
  };

  private _handleEdgeMouseDown(evt: MouseEvent, id: string): void {
    if (this._edges.hasOwnProperty(id) && this._paperInstance && this._paper) {
      const edge = this._edges[id];
      // Set clicked edge as moving item.
      this._paperInstance.updateActiveItem({
        id,
        paperItemState: PaperItemState.Moving,
        elementType: ElementType.Edge,
      });
      // Store initial mouse coordinates.
      this._initialMouseCoords = {
        x: evt.pageX,
        y: evt.pageY,
      };
      // Get stored and actual edge coordinates.
      const storedCoords = edge.coords;
      const actualCoords = edge.instance.getCoordinates();

      // Find storedCoord
      const closestPointAndDistance = storedCoords
        .map(coord => ({
          distance: distanceBetweenPoints(coord, this
            ._initialMouseCoords as ICoordinates),
          point: coord,
        }))
        .reduce<{ distance: number; point: ICoordinates | null }>(
          (closestPoint, currentPointAndDistance) =>
            closestPoint.distance <= currentPointAndDistance.distance
              ? closestPoint
              : currentPointAndDistance,
          { distance: Infinity, point: null },
        );

      if (closestPointAndDistance.distance <= this._gridSize) {
        const indexOfStoredCoord = storedCoords.indexOf(
          closestPointAndDistance.point as ICoordinates,
        );
        //
      }

      // For each edge, check distance. Find closest one. Then, iterate along
      // storedCoords and try to find
    } else {
      throw new PaperError(
        'E_NO_ID',
        `Edge with id ${id} does not exist.`,
        'MouseEvents.ts',
        '_handleEdgeMouseDown',
      );
    }
  }

  private _handleEdgeMouseMove = (evt: MouseEvent): void => {
    // TODO: implement.
  };

  private _handleEdgeMouseUp = (): void => {
    // TODO: implement.
    // 1. If double click timer is running and not timed out, remove the edge
    //    coordinate.
    // 2. If mouse coordinates haven't changed, start double click timer.
  };

  private _handlePaperMouseDown(evt: MouseEvent, id: string): void {
    // TODO: implement.
    // Deselect any selected items.
    if (this._paperInstance) {
      this._paperInstance.updateActiveItem();
    }
  }

  private _resetMouseListeners(): void {
    // Remove listeners.
    document.removeEventListener('mousemove', this._handleNodeMouseMove);
    document.removeEventListener('mouseup', this._handleNodeMouseUp);
    document.removeEventListener('mousemove', this._handleEdgeMouseMove);
    document.removeEventListener('mouseup', this._handleEdgeMouseUp);
    // Reset coordinates.
    this._initialMouseCoords = null;
    this._initialPaperCoords = null;
  }
}
