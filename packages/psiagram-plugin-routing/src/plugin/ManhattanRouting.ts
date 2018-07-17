/**
 * Copyright (c) 2018-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  Paper,
  roundToNearest,
  PsiagramPlugin,
  ICoordinates,
  IPaperStoredNode,
  IPaperStoredEdge,
  IPluginProperties,
  PaperEvent,
  getEdgeNodeIntersection,
} from 'psiagram';

export enum Direction {
  Vertical = 'V',
  Horizontal = 'H',
}

export interface IBoundingBox {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

// Minimum distance to extend out of a Node regardless of gridSize.
const MINIMUM_NODE_EXTENSION = 20;

export class ManhattanRouting implements PsiagramPlugin {
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

    this._paperInstance.addListener('move-edge', this._updateEdgeRoute);
  }

  protected _updateEdgeRoute = (evt: PaperEvent): void => {
    const paper = evt.paper;
    const edge = evt.target as IPaperStoredEdge;
    const {
      nodes: { sourceNode, sourceMidPoint, targetNode, targetMidPoint },
      points: { sourcePoint, targetPoint },
    } = evt.data as {
      nodes: {
        sourceNode: IPaperStoredNode | null;
        sourceMidPoint: ICoordinates | null;
        targetNode: IPaperStoredNode | null;
        targetMidPoint: ICoordinates | null;
      };
      points: {
        sourcePoint: ICoordinates | null;
        targetPoint: ICoordinates | null;
      };
    };

    let finalSourcePoint = sourcePoint;
    let finalTargetPoint = targetPoint;

    let prevDirection: Direction = Direction.Horizontal;
    let fullCoordinates: ICoordinates[] = [];

    const bufferSize = Math.max(MINIMUM_NODE_EXTENSION, this._gridSize);

    const sourceBox = this._getBoundingBox(sourceNode, sourcePoint, bufferSize);
    const targetBox = this._getBoundingBox(targetNode, targetPoint, bufferSize);

    // Get initial sub-points.
    const sourceSubPoints = this._getSubPoints(
      (sourceMidPoint || sourcePoint) as ICoordinates,
      edge.coords[0] || targetMidPoint || targetPoint,
      sourceBox,
      edge.coords[0] ? null : targetBox,
      null,
    );
    prevDirection = sourceSubPoints.prevDirection;
    fullCoordinates = sourceSubPoints.coords;

    // Get sub-points for each coordinate.
    edge.coords.forEach((coord, index) => {
      const subPoints = this._getSubPoints(
        coord,
        edge.coords[index + 1] || targetMidPoint || targetPoint,
        null,
        edge.coords[index + 1] ? null : targetBox,
        prevDirection,
      );
      prevDirection = subPoints.prevDirection;
      fullCoordinates = [...fullCoordinates, coord, ...subPoints.coords];
    });

    if (sourceNode) {
      finalSourcePoint = getEdgeNodeIntersection(
        sourceNode,
        fullCoordinates[0],
        this._gridSize,
      );
    }
    if (targetNode) {
      finalTargetPoint = getEdgeNodeIntersection(
        targetNode,
        fullCoordinates[fullCoordinates.length - 1],
        this._gridSize,
        4,
      );
    }

    edge.instance.updatePath(
      finalSourcePoint as ICoordinates,
      finalTargetPoint as ICoordinates,
      fullCoordinates.map(coordinate => ({
        x: roundToNearest(coordinate.x, this._gridSize),
        y: roundToNearest(coordinate.y, this._gridSize),
      })),
    );

    evt.preventDefault();
  };

  protected _getSubPoints(
    sourcePoint: ICoordinates,
    targetPoint: ICoordinates,
    sourceBox: IBoundingBox | null,
    targetBox: IBoundingBox | null,
    prevDirection: Direction | null,
  ): { prevDirection: Direction; coords: ICoordinates[] } {
    const verticalExit = { x: sourcePoint.x, y: targetPoint.y };
    const horizontalExit = { x: targetPoint.x, y: sourcePoint.y };

    /*
     * SOURCE --> TARGET
     */
    if (sourceBox && targetBox) {
      const areColliding =
        sourceBox.left < targetBox.right &&
        targetBox.left < sourceBox.right &&
        sourceBox.top < targetBox.bottom &&
        targetBox.top < sourceBox.bottom;

      // If Nodes are colliding, check which is higher.
      if (areColliding) {
        // If source is lower than target, exit from top and loop back.
        if (sourcePoint.y > targetPoint.y) {
          const maxY = Math.max(sourceBox.bottom, targetBox.bottom);
          return {
            prevDirection: Direction.Vertical,
            coords: [
              { x: sourcePoint.x, y: maxY },
              { x: targetPoint.x, y: maxY },
            ],
          };
        }
        // Else exit from bottom and loop back.
        const minY = Math.min(sourceBox.top, targetBox.top);
        return {
          prevDirection: Direction.Vertical,
          coords: [
            { x: sourcePoint.x, y: minY },
            { x: targetPoint.x, y: minY },
          ],
        };
      }

      // Check if target is within x-range of sourceBox.
      if (targetPoint.x < sourceBox.right && targetPoint.x > sourceBox.left) {
        // If source is higher than target, exit from bottom and zig-zag.
        if (sourcePoint.y < targetPoint.y) {
          return {
            prevDirection: Direction.Vertical,
            coords: [
              { x: sourcePoint.x, y: sourceBox.bottom },
              { x: targetPoint.x, y: sourceBox.bottom },
            ],
          };
        }
        // Else exit from top and zig-zag.
        return {
          prevDirection: Direction.Vertical,
          coords: [
            { x: sourcePoint.x, y: sourceBox.top },
            { x: targetPoint.x, y: sourceBox.top },
          ],
        };
      }

      // Check if target is within y-range of sourceBox.
      if (sourcePoint.y < targetBox.bottom && sourcePoint.y > targetBox.top) {
        // If source is further left than target, exit from right and zig-zag.
        if (sourcePoint.x < targetPoint.x) {
          return {
            prevDirection: Direction.Horizontal,
            coords: [
              { x: sourceBox.right, y: sourcePoint.y },
              { x: sourceBox.right, y: targetPoint.y },
            ],
          };
        }
        // Else exit from left and zig-zag.
        return {
          prevDirection: Direction.Horizontal,
          coords: [
            { x: sourceBox.left, y: sourcePoint.y },
            { x: sourceBox.left, y: targetPoint.y },
          ],
        };
      }

      // If no overlap, and target is not within range, exit horizontally.
      return {
        prevDirection: Direction.Vertical,
        coords: [horizontalExit],
      };
    }

    /*
     * SOURCE --> POINT
     */
    if (sourceBox) {
      // If target is within y-range of sourceBox, exit horizontally.
      if (targetPoint.y > sourceBox.top && targetPoint.y < sourceBox.bottom) {
        return {
          prevDirection: Direction.Vertical,
          coords: [horizontalExit],
        };
      }
      // Else exit vertically.
      return {
        prevDirection: Direction.Horizontal,
        coords: [verticalExit],
      };
    }

    /*
     * POINT --> POINT
     */
    if (prevDirection) {
      // If previous direction, preserve direction.
      switch (prevDirection) {
        case Direction.Vertical:
          return {
            prevDirection: Direction.Horizontal,
            coords: [verticalExit],
          };
        case Direction.Horizontal:
        default:
          return {
            prevDirection: Direction.Vertical,
            coords: [horizontalExit],
          };
      }
    }
    // Else exit horizontally.
    return {
      prevDirection: Direction.Vertical,
      coords: [horizontalExit],
    };
  }

  protected _getBoundingBox(
    node: IPaperStoredNode | null,
    point: ICoordinates | null,
    bufferSize: number,
  ): IBoundingBox {
    if (node) {
      return {
        top: node.coords.y - bufferSize,
        bottom: node.coords.y + node.instance.height + bufferSize,
        left: node.coords.x - bufferSize,
        right: node.coords.x + node.instance.width + bufferSize,
      };
    } else if (point) {
      return {
        top: point.y - bufferSize,
        bottom: point.y + bufferSize,
        left: point.x - bufferSize,
        right: point.x + bufferSize,
      };
    }
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }
}
