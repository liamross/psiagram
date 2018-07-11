/**
 * Copyright (c) 2018-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  Paper,
  getWorkflowType,
  WorkflowType,
  PaperItemState,
  roundToNearest,
  PsiagramPlugin,
  ICoordinates,
  IPaperStoredNode,
  IPaperStoredEdge,
  IPluginProperties,
  PaperError,
  PaperEvent,
} from 'psiagram';

/*
  Rules:

  A. Edge must extrude one gridSize out of Node before taking a right angle.

  B. Edge must travel the shortest distance between points, taking into account
     the size and proportions of the Node it's attached to.

  C. If two approaches are the same distance, ex. if from a point to a point,
      then Edge must preserve the direction it is traveling currently.

  -----------------------------------------------------------------

  Note: if points are in line, Edge should always be a straight line.

  Note: Treat the point one gridSize out from Node as the point!

  Note: If paths are equal without previous direction, then use some default.
        This can just be determined through the logic of the calc (ex. minValue)

  -----------------------------------------------------------------

  Steps:
  
  1. From Node midpoint or point, determine direction of next point.

 *  NW    N    NE
 *        |
 *  W ----|---- E
 *        |
 *  SW    S    SE

  2. Then rule out two sides for each Node that exists in the pairing

  3. Find the point one gridSize outside of each Node side (or some default)

  4. Calculate shortest length. Cases:

      A. Two Nodes
          - NodeA.a to NodeB.a
          - NodeA.b to NodeB.a
          - NodeA.a to NodeB.b
          - NodeA.b to NodeB.b
          - (Decide on some default if some are equal)

      B. One Node, One Point
          - NodeA.a to point
          - NodeA.b to point
          - (Preserve direction if equal, or if Node is first do default)

      B. Two Points
          - (Preserve direction, or if no direction do default)

  5. Add points to array to create 90 degree angles

  6. Prevent Default

  ---------------------------------------------

  Default exit direction: Preserve or Horizontal

  Default entry direction: Vertical


const minX = point.x - ((node.width / 2) + Math.max(MINIMUM_NODE_EXTENSION, gridSize))
const maxX = point.x + ((node.width / 2) + Math.max(MINIMUM_NODE_EXTENSION, gridSize))

if (targetPoint < minX) {
  // Direction is left

}
*/

export enum Direction {
  N = 'N',
  NE = 'NE',
  E = 'E',
  SE = 'SE',
  S = 'S',
  SW = 'SW',
  W = 'W',
  NW = 'NW',
  INV = '',
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
  }

  protected _updateEdgeRoute = (evt: PaperEvent) => {
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
    const bufferSize = Math.max(MINIMUM_NODE_EXTENSION, this._gridSize);

    const sourceBox = this._getBoundingBox(sourceNode, sourcePoint, bufferSize);
    const targetBox = this._getBoundingBox(targetNode, targetPoint, bufferSize);
  };

  protected _getSubPoint(
    sourcePoint: ICoordinates,
    targetPoint: ICoordinates,
    sourceBox: IBoundingBox | null,
    targetBox: IBoundingBox | null,
    prevDirection: 'H' | 'V' | null,
  ): ICoordinates[] {
    const verticalExit = { x: sourcePoint.x, y: targetPoint.y };
    const horizontalExit = { x: targetPoint.x, y: sourcePoint.y };

    // Straight from source to target.
    if (sourceBox && targetBox) {
      const areColliding =
        sourceBox.left < targetBox.right &&
        targetBox.left < sourceBox.right &&
        sourceBox.top < targetBox.bottom &&
        targetBox.top < sourceBox.bottom;

      if (areColliding) {
        // If Nodes are colliding, check which is higher.
        if (sourcePoint.x < targetPoint.x) {
          // If source is lower than target, exit from top.
          const y = Math.max(sourceBox.bottom, targetBox.bottom);
          return [{ x: sourcePoint.x, y }, { x: targetPoint.x, y }];
        } else {
          // Else exit from bottom.
          const y = Math.min(sourceBox.top, targetBox.top);
          return [{ x: sourcePoint.x, y }, { x: targetPoint.x, y }];
        }
      } else {
        // If Nodes are not colliding, check range of target midpoint.
        if (targetPoint.x < sourceBox.right && targetPoint.x > sourceBox.left) {
          // Target is within x-range of sourceBox.
          if (sourcePoint.x < targetPoint.x) {
            // If source is lower than target, exit from bottom.
            return [
              { x: sourcePoint.x, y: sourceBox.bottom },
              { x: targetPoint.x, y: sourceBox.bottom },
            ];
          } else {
            // Else exit from top.
            return [
              { x: sourcePoint.x, y: sourceBox.top },
              { x: targetPoint.x, y: sourceBox.top },
            ];
          }
        } else if (
          targetPoint.y < sourceBox.top &&
          targetPoint.y > sourceBox.bottom
        ) {
          // Target is within y-range of sourceBox.
          if (sourcePoint.y < targetPoint.y) {
            // If source is further right than target, exit from right.
            return [
              { x: sourceBox.right, y: sourcePoint.y },
              { x: sourceBox.right, y: targetPoint.y },
            ];
          } else {
            // Else exit from left.
            return [
              { x: sourceBox.left, y: sourcePoint.y },
              { x: sourceBox.left, y: targetPoint.y },
            ];
          }
        }
      }
    }

    // Originating at source.
    // - If targetPoint.y is within bound of sourceBox, exit horizontally.
    // - Else, exit vertically.
    if (sourceBox) {
      if (targetPoint.y < sourceBox.top && targetPoint.y > sourceBox.bottom) {
        return [horizontalExit];
      }
      return [verticalExit];
    }

    // Originating from intermediate point with previous direction.
    // - Preserve previous direction, or exit horizontally if invalid.
    if (prevDirection) {
      switch (prevDirection) {
        case 'V':
          return [verticalExit];
        case 'H':
        default:
          return [horizontalExit];
      }
    }

    // Originating from intermediate point with no previous direction.
    // - Exit sourcePoint horizontally.
    return [horizontalExit];
  }

  private _getBoundingBox(
    node: IPaperStoredNode | null,
    point: ICoordinates | null,
    bufferSize: number,
  ): IBoundingBox {
    if (node) {
      const widthBuffer = node.instance.width / 2 + bufferSize;
      const heightBuffer = node.instance.height / 2 + bufferSize;

      return {
        top: node.coords.x - heightBuffer,
        bottom: node.coords.x + heightBuffer,
        left: node.coords.y - widthBuffer,
        right: node.coords.y + widthBuffer,
      };
    } else if (point) {
      return {
        top: point.x - bufferSize,
        bottom: point.x + bufferSize,
        left: point.y - bufferSize,
        right: point.y + bufferSize,
      };
    }
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }
}
