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
  roundToNearest,
  PsiagramPlugin,
  ICoordinates,
  IPaperStoredNode,
  IPaperStoredEdge,
  IPluginProperties,
  PaperError,
  distanceBetweenPoints,
  roundCoordsToNearest,
  distanceFromLine,
  areCoordsEqual,
} from 'psiagram';

const DOUBLE_CLICK_TIME_MAX = 500;

export class MouseEvents implements PsiagramPlugin {
  private _paperInstance: Paper | null;
  private _paper: SVGElement | null;
  private _paperWrapper: HTMLElement | null;
  private _nodes: { [key: string]: IPaperStoredNode };
  private _edges: { [key: string]: IPaperStoredEdge };
  private _initialMouseCoords: ICoordinates | null;
  private _initialPaperCoords: ICoordinates | null;
  private _gridSize: number;
  private _edgeCoordIndex: number;
  private _doubleClickTimer: number | null;

  constructor() {
    this._paperInstance = null;
    this._paperWrapper = null;
    this._paper = null;
    this._nodes = {};
    this._edges = {};
    this._initialMouseCoords = null;
    this._initialPaperCoords = null;
    this._gridSize = 0;
    this._edgeCoordIndex = -1;
    this._doubleClickTimer = null;
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
        isMoving: true,
        elementType: ElementType.Node,
        isSelected: false,
      });
      // Store initial mouse coordinates.
      this._initialMouseCoords = {
        x: evt.pageX,
        y: evt.pageY,
      };
      // Store original coordinates in paper (to nearest grid).
      this._initialPaperCoords = roundCoordsToNearest(
        node.coords,
        this._gridSize,
      );
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
      activeItem.isMoving &&
      activeItem.elementType === ElementType.Node &&
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
      // Set coordinates.
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
      activeItem.isMoving &&
      activeItem.elementType === ElementType.Node &&
      this._paperInstance
    ) {
      // Set active node to selected state.
      this._paperInstance.updateActiveItem({
        ...activeItem,
        isMoving: false,
        isSelected: true,
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
      this._startDoubleClickTimer();
      // Set clicked edge as moving item.
      this._paperInstance.updateActiveItem({
        id,
        isMoving: true,
        elementType: ElementType.Edge,
        isSelected: false,
      });
      // Store initial mouse coordinates.
      this._initialMouseCoords = {
        x: evt.pageX,
        y: evt.pageY,
      };
      // Get stored and actual edge coordinates.
      const storedCoords = edge.coords;
      const actualCoords = edge.instance.getCoordinates();

      // If there are no stored coordinates, add one and set it as moving.
      if (storedCoords.length === 0) {
        edge.coords = [
          roundCoordsToNearest(this._initialMouseCoords, this._gridSize),
        ];
        this._edgeCoordIndex = 0;
        // Initialize mouse movement and release listeners.
        document.addEventListener('mousemove', this._handleEdgeMouseMove);
        document.addEventListener('mouseup', this._handleEdgeMouseUp);
        return;
      }

      // Find closest stored coordinate, and the distance to rounded coord. If
      // it is less than a grid length away, then this will now be the moving
      // coordinate.
      const closestPointAndDistance = storedCoords
        .map(coord => ({
          distance: distanceBetweenPoints(
            roundCoordsToNearest(coord, this._gridSize),
            this._initialMouseCoords as ICoordinates,
          ),
          point: coord,
        }))
        .reduce<{ distance: number; point: ICoordinates }>(
          (closestPoint, currentPointAndDistance) =>
            closestPoint.distance <= currentPointAndDistance.distance
              ? closestPoint
              : currentPointAndDistance,
          { distance: Infinity, point: { x: 0, y: 0 } },
        );
      if (closestPointAndDistance.distance <= this._gridSize) {
        const indexOfStoredCoord = storedCoords.indexOf(
          closestPointAndDistance.point,
        );
        this._edgeCoordIndex = indexOfStoredCoord;
        // Initialize mouse movement and release listeners.
        document.addEventListener('mousemove', this._handleEdgeMouseMove);
        document.addEventListener('mouseup', this._handleEdgeMouseUp);
        return;
      }

      // For each edge, check distance. Find closest one. Then, iterate along
      // storedCoords and try to find the preceeding stored coordinate. Add a
      // point after this, and set as moving.
      let closestSegment: ICoordinates[] = [];
      let closestDistance: number = Infinity;
      let indexOfInitial: number = -1;
      for (let i = 0; i < actualCoords.length - 1; i++) {
        const thisSegment = [actualCoords[i], actualCoords[i + 1]];
        const thisDistance = distanceFromLine(
          actualCoords[i],
          actualCoords[i + 1],
          this._initialMouseCoords,
        );
        if (thisDistance < closestDistance) {
          closestSegment = thisSegment;
          closestDistance = thisDistance;
          indexOfInitial = i;
        }
      }
      // If beginning of segment matches a coord, insert after.
      const matchingStartIndex = storedCoords.findIndex(coord =>
        areCoordsEqual(
          roundCoordsToNearest(coord, this._gridSize),
          closestSegment[0],
        ),
      );
      if (matchingStartIndex >= 0) {
        const newIndex = matchingStartIndex + 1;
        edge.coords = [
          ...edge.coords.slice(0, newIndex),
          roundCoordsToNearest(this._initialMouseCoords, this._gridSize),
          ...edge.coords.slice(newIndex + 1),
        ];
        this._edgeCoordIndex = newIndex;
        // Initialize mouse movement and release listeners.
        document.addEventListener('mousemove', this._handleEdgeMouseMove);
        document.addEventListener('mouseup', this._handleEdgeMouseUp);
        return;
      }
      // If end of segment matches a coord, insert before.
      const matchingEndIndex = storedCoords.findIndex(coord =>
        areCoordsEqual(
          roundCoordsToNearest(coord, this._gridSize),
          closestSegment[1],
        ),
      );
      if (matchingEndIndex >= 0) {
        const newIndex = matchingEndIndex;
        edge.coords = [
          ...edge.coords.slice(0, newIndex),
          roundCoordsToNearest(this._initialMouseCoords, this._gridSize),
          ...edge.coords.slice(newIndex + 1),
        ];
        this._edgeCoordIndex = newIndex;
        // Initialize mouse movement and release listeners.
        document.addEventListener('mousemove', this._handleEdgeMouseMove);
        document.addEventListener('mouseup', this._handleEdgeMouseUp);
        return;
      }
      // Else, iterate through stored coords to find coord that it comes before.
      for (const storedCoord of storedCoords) {
        const indexOfStored = actualCoords.findIndex(actualCoord =>
          areCoordsEqual(
            roundCoordsToNearest(storedCoord, this._gridSize),
            actualCoord,
          ),
        );
        if (indexOfInitial < indexOfStored) {
          const newIndex = indexOfStored;
          edge.coords = [
            ...edge.coords.slice(0, newIndex),
            roundCoordsToNearest(this._initialMouseCoords, this._gridSize),
            ...edge.coords.slice(newIndex + 1),
          ];
          this._edgeCoordIndex = newIndex;
          // Initialize mouse movement and release listeners.
          document.addEventListener('mousemove', this._handleEdgeMouseMove);
          document.addEventListener('mouseup', this._handleEdgeMouseUp);
          return;
        }
      }
      // Else insert at end of coords.
      edge.coords = [
        ...edge.coords,
        roundCoordsToNearest(this._initialMouseCoords, this._gridSize),
      ];
      this._edgeCoordIndex = edge.coords.length - 1;
      // Initialize mouse movement and release listeners.
      document.addEventListener('mousemove', this._handleEdgeMouseMove);
      document.addEventListener('mouseup', this._handleEdgeMouseUp);
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
    const activeItem = this._paperInstance
      ? this._paperInstance.getActiveItem()
      : null;

    if (
      activeItem &&
      activeItem.isMoving &&
      activeItem.elementType === ElementType.Edge &&
      this._initialMouseCoords &&
      this._paperInstance
    ) {
      this._stopDoubleClickTimer();
      const id = activeItem.id;
      // Find mouse deltas vs original coordinates.
      const mouseDeltaX = this._initialMouseCoords.x - evt.pageX;
      const mouseDeltaY = this._initialMouseCoords.y - evt.pageY;
      // Find new coordinate.
      const x = roundToNearest(
        this._initialMouseCoords.x - mouseDeltaX,
        this._gridSize,
      );
      const y = roundToNearest(
        this._initialMouseCoords.y - mouseDeltaY,
        this._gridSize,
      );
      // Set coordinates.
      const edge = this._paperInstance.getEdge(id);
      edge.coords = [
        ...edge.coords.slice(0, this._edgeCoordIndex),
        { x, y },
        ...edge.coords.slice(this._edgeCoordIndex + 1),
      ];
    } else {
      throw new PaperError(
        'E_INV_ACT',
        `No current moving Edge. Active item: ${JSON.stringify(activeItem)}`,
        'MouseEvents.ts',
        '_handleEdgeMouseMove',
      );
    }
  };

  private _handleEdgeMouseUp = (): void => {
    const activeItem = this._paperInstance
      ? this._paperInstance.getActiveItem()
      : null;

    if (
      activeItem &&
      activeItem.isMoving &&
      activeItem.elementType === ElementType.Edge &&
      this._paperInstance
    ) {
      // Remove point if double click is valid.
      if (this._isDoubleClickValid()) {
        const edge = this._paperInstance.getEdge(activeItem.id);
        edge.coords = [
          ...edge.coords.slice(0, this._edgeCoordIndex),
          ...edge.coords.slice(this._edgeCoordIndex + 1),
        ];
      }
      // Set active edge to selected state.
      this._paperInstance.updateActiveItem({
        ...activeItem,
        isMoving: false,
        isSelected: true,
      });
    } else {
      throw new PaperError(
        'E_INV_ACT',
        `No current moving Edge. Active item: ${JSON.stringify(activeItem)}`,
        'MouseEvents.ts',
        '_handleEdgeMouseUp',
      );
    }
    // Remove listeners and reset coordinates.
    this._resetMouseListeners();
  };

  private _handlePaperMouseDown(evt: MouseEvent, id: string): void {
    // TODO: implement.
    // Deselect any selected items.
    if (this._paperInstance) {
      this._paperInstance.updateActiveItem();
    }
  }

  private _startDoubleClickTimer(): void {
    this._doubleClickTimer = new Date().getTime();
  }

  private _stopDoubleClickTimer(): void {
    this._doubleClickTimer = null;
  }

  private _isDoubleClickValid(): boolean {
    if (!this._doubleClickTimer) return false;
    const currentTime: number = new Date().getTime();
    return (
      DOUBLE_CLICK_TIME_MAX <= Math.abs(currentTime - this._doubleClickTimer)
    );
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
