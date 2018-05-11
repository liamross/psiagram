import { IPaperStoredNode } from '../Paper/IPaper';

/**
 * Returns true if nodes are overlapping in the workspace, false otherwise.
 * Will return false if either node is an invalid value.
 */
export const isNodeColliding = (
  node1: IPaperStoredNode,
  node2: IPaperStoredNode,
  gridSize: number,
  allowContact: boolean,
): boolean => {
  if (!node1 || !node2) return false;

  const { x: node1_x, y: node1_y } = node1.coords;
  const { x: node2_x, y: node2_y } = node2.coords;
  const { width: node1_w, height: node1_h } = getWidthHeight(node1);
  const { width: node2_w, height: node2_h } = getWidthHeight(node2);

  return (
    node1_x < node2_x + (allowContact ? 0 : gridSize / 2) + node2_w &&
    node2_x < node1_x + (allowContact ? 0 : gridSize / 2) + node1_w &&
    node1_y < node2_y + (allowContact ? 0 : gridSize / 2) + node2_h &&
    node2_y < node1_y + (allowContact ? 0 : gridSize / 2) + node1_h
  );
};

/**
 * Rounds number to nearest interval. Returns number if interval is 0.
 */
export const roundToNearest = (number: number, interval: number = 0): number =>
  interval ? Math.round(number / interval) * interval : number;

/**
 * Sets the node that has matching id to end of array, making it the top
 * element in the svg. Returns a new array with matching node as last item.
 */
export const nodeToFront = (
  id: string,
  nodes: Array<IPaperStoredNode>,
): Array<IPaperStoredNode> => {
  const sortNodes = nodes.slice();
  return sortNodes.sort((a, b) => (a.id === id ? 1 : b.id === id ? -1 : 0));
};

/**
 * Find the coordinates of a node's midpoint.
 */
export const getNodeMidpoint = (node, gridSize = 0) => {
  const { width, height } = getWidthHeight(node);
  return {
    x: roundToNearest(node.x + width / 2, gridSize),
    y: roundToNearest(node.y + height / 2, gridSize),
  };
};

/**
 * Finds the point along the side of the node to trip edge to.
 */
export const getEdgeNodeIntersection = (
  intersectPoint: { x: number; y: number },
  nextPoint: { x: number; y: number },
  node: IPaperStoredNode,
): { x: number; y: number } => {
  const lineA = [intersectPoint.x, intersectPoint.y, nextPoint.x, nextPoint.y];
  const { x: nx, y: ny } = node.coords;
  const { width: nw, height: nh } = getWidthHeight(node);
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
    // Default.
    { x: intersectPoint.x, y: intersectPoint.y }
  );
};

/**
 * Returns node's width and height.
 */
export const getWidthHeight = (
  node: IPaperStoredNode,
): { width: number; height: number } => {
  const params = node.params;
  return params;
};

/**
 * Find intersect between two lines if it exists.
 */
export function lineIntersect(...xy: number[]): { x: number; y: number } | null;
export function lineIntersect(
  // Line 1
  x1: number, // - Point A, X-coordinate.
  y1: number, // - Point A, Y-coordinate.
  x2: number, // - Point B, X-coordinate.
  y2: number, // - Point B, Y-coordinate.
  // Line 2
  x3: number, // - Point A, X-coordinate.
  y3: number, // - Point A, Y-coordinate.
  x4: number, // - Point B, X-coordinate.
  y4: number, // - Point B, Y-coordinate.
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
