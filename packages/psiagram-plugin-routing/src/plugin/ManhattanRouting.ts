/**
 * Copyright (c) 2018-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  Paper,
  PsiagramPlugin,
  ICoordinates,
  IPaperStoredNode,
  IPaperStoredEdge,
  IPluginProperties,
  PaperEvent,
  PaperEventType,
} from 'psiagram';

export interface IManhattanRoutingProperties {
  minimumEdgeExtension?: number;
}

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

export class ManhattanRouting implements PsiagramPlugin {
  private _paperInstance: Paper | null;
  private _gridSize: number;
  private _minimumEdgeExtension: number;

  constructor(manhattanRoutingProperties?: IManhattanRoutingProperties) {
    this._paperInstance = null;
    this._gridSize = 0;
    this._minimumEdgeExtension =
      (manhattanRoutingProperties &&
        manhattanRoutingProperties.minimumEdgeExtension) ||
      20;
  }

  public initialize(paper: Paper, properties: IPluginProperties): void {
    this._paperInstance = paper;
    this._gridSize = properties.attributes.gridSize;

    this._paperInstance.addListener(
      PaperEventType.MoveEdge,
      this._updateEdgeRoute,
    );
  }

  public teardown() {
    if (this._paperInstance) {
      this._paperInstance.removeListener(
        PaperEventType.MoveEdge,
        this._updateEdgeRoute,
      );
    }
  }

  protected _updateEdgeRoute = (
    evt: PaperEvent<PaperEventType.MoveEdge>,
  ): void => {
    const { source, target, coords } = evt.data;

    const initialCoordinates = [...coords];

    let prevDirection: Direction = Direction.Horizontal;
    let manhattanCoords: ICoordinates[] = [];

    const sourceBox = this._getBoundingBox(source.node, source.point);
    const targetBox = this._getBoundingBox(target.node, target.point);

    // Get initial sub-points.
    const sourceSubPoints = this._getSubPoints(
      (source.midpoint || source.point) as ICoordinates,
      initialCoordinates[0] || target.midpoint || target.point,
      sourceBox,
      initialCoordinates[0] ? null : targetBox,
      null,
    );
    prevDirection = sourceSubPoints.prevDirection;
    manhattanCoords = sourceSubPoints.coords;

    // Get sub-points for each coordinate.
    initialCoordinates.forEach((coord, index) => {
      const subPoints = this._getSubPoints(
        coord,
        initialCoordinates[index + 1] || target.midpoint || target.point,
        null,
        initialCoordinates[index + 1] ? null : targetBox,
        prevDirection,
      );
      prevDirection = subPoints.prevDirection;
      manhattanCoords = [...manhattanCoords, coord, ...subPoints.coords];
    });

    // Set new coords for data.
    const data = evt.data;
    data.coords = manhattanCoords;
  };

  /**
   * Get a bounding box for a Node or point.
   *
   * @param node Optional. Node to get bounding box of.
   * @param point Optional. If no Node, then give a point to get bounding box.
   */
  protected _getBoundingBox(
    node: IPaperStoredNode | null,
    point: ICoordinates | null,
  ): IBoundingBox {
    const bufferSize = Math.max(this._minimumEdgeExtension, this._gridSize);
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

  /**
   * Get an array of sub-points to place in-between source and target points, as
   * well as the direction Edge is traveling at the target point.
   *
   * @param sourcePoint Source point of Edge section.
   * @param targetPoint Target point of Edge section.
   * @param sourceBox Optional. Bounding box for source point.
   * @param targetBox Optional. Bounding box for target point.
   * @param prevDirection Optional. Previous direction Edge was traveling.
   */
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
        // If source is lower than target, exit from bottom and loop back.
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
        // Else exit from top and loop back.
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

      // Check if source is within y-range of targetBox.
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
}
