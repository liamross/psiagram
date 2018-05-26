import { IPaperStoredNode } from '../components/Paper';
import { IParameters, ICoordinates } from '../common/types';

/**
 * Returns true if nodes are overlapping in the workspace, false otherwise.
 * Will return false if either node is an invalid value.
 *
 * @param node1 The first node.
 * @param node2 The second node.
 * @param gridSize The size of the grid.
 * @param allowContact Is contact allowed (touching sides).
 */
export const isNodeColliding = (
  node1: IPaperStoredNode,
  node2: IPaperStoredNode,
  gridSize: number,
  allowContact: boolean,
): boolean => {
  if (!node1 || !node2) {
    return false;
  }

  // tslint:disable:variable-name
  const { x: node1_x, y: node1_y } = node1.coords;
  const { x: node2_x, y: node2_y } = node2.coords;
  const { width: node1_w, height: node1_h } = getWidthHeight(node1);
  const { width: node2_w, height: node2_h } = getWidthHeight(node2);
  // tslint:enable:variable-name

  return (
    node1_x < node2_x + (allowContact ? 0 : gridSize / 2) + node2_w &&
    node2_x < node1_x + (allowContact ? 0 : gridSize / 2) + node1_w &&
    node1_y < node2_y + (allowContact ? 0 : gridSize / 2) + node2_h &&
    node2_y < node1_y + (allowContact ? 0 : gridSize / 2) + node1_h
  );
};

/**
 * Rounds number to nearest interval. Returns number if interval is 0.
 *
 * @param num The number to round.
 * @param interval The size of the interval to round to.
 */
export const roundToNearest = (num: number, interval: number = 0): number =>
  interval ? Math.round(num / interval) * interval : num;

/**
 * Find the coordinates of a node's midpoint.
 *
 * @param node The node to get midpoint of.
 * @param gridSize The size of the grid to snap to.
 */
export const getNodeMidpoint = (
  node: IPaperStoredNode,
  gridSize: number = 0,
): ICoordinates => {
  const { width, height } = getWidthHeight(node);
  return {
    x: roundToNearest(node.coords.x + width / 2, gridSize),
    y: roundToNearest(node.coords.y + height / 2, gridSize),
  };
};

/**
 * Finds the point along the side of the node to trip edge to.
 *
 * @param node Node with boundary to trim edge at.
 * @param nextPoint The next point closest to the node center.
 * @param [gridSize] The size of the grid to snap to.
 * @param [nodeOutline] Distance in px away from node to trim edge.
 */
export const getEdgeNodeIntersection = (
  node: IPaperStoredNode,
  nextPoint: { x: number; y: number },
  gridSize?: number,
  nodeOutline?: number,
): { x: number; y: number } => {
  const midPoint = getNodeMidpoint(node, gridSize);
  const lineA = [midPoint.x, midPoint.y, nextPoint.x, nextPoint.y];

  let { x: nx, y: ny } = node.coords;
  let { width: nw, height: nh } = getWidthHeight(node);

  if (nodeOutline) {
    nx = nx - nodeOutline;
    ny = ny - nodeOutline;
    nw = nw + nodeOutline * 2;
    nh = nh + nodeOutline * 2;
  }

  // prettier-ignore
  return (
    // Left edge.
    lineIntersect(...lineA, nx     , ny     , nx     , ny + nh) ||
    // Right edge.
    lineIntersect(...lineA, nx + nw, ny     , nx + nw, ny + nh) ||
    // Top edge.
    lineIntersect(...lineA, nx     , ny     , nx + nw, ny     ) ||
    // Bottom edge.
    lineIntersect(...lineA, nx     , ny + nh, nx + nw, ny + nh) ||
    // Default to the center point of the node.
    { x: midPoint.x, y: midPoint.y }
  );
};

/**
 * Returns node's width and height. Attempts to call getParameters on instance,
 * and defaults to node.params if unsuccessful.
 *
 * @param node The node to find width and height of.
 */
export const getWidthHeight = (node: IPaperStoredNode): IParameters => {
  const params = node.instance.getParameters() || node.params;
  return params;
};

/**
 * Find intersect between two lines if it exists.
 *
 * Line 1:
 *
 * @param x1 Point A, X-coordinate.
 * @param y1 Point A, Y-coordinate.
 *
 * @param x2 Point B, X-coordinate.
 * @param y2 Point B, Y-coordinate.
 *
 * Line 2:
 *
 * @param x3 Point A, X-coordinate.
 * @param y3 Point A, Y-coordinate.
 *
 * @param x4 Point B, X-coordinate.
 * @param y4 Point B, Y-coordinate.
 */
export function lineIntersect(...xy: number[]): { x: number; y: number } | null;
export function lineIntersect(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  x4: number,
  y4: number,
): { x: number; y: number } | null {
  const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  if (denom) {
    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
    const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
    return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1
      ? { x: x1 + ua * (x2 - x1), y: y1 + ua * (y2 - y1) }
      : null;
  }
  return null;
}
