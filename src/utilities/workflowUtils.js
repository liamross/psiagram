/**
 * Returns true if nodes are overlapping in the workspace, false otherwise.
 * Will return false if either node is an invalid value.
 * @param {Object} node1 - First node to compare.
 * @param {Object} node2 - Second node to compare.
 * @param {number} gridSize - Size of workspace grid.
 * @param {boolean} allowContact - If false, nodes have 1-gridSize buffer.
 * @returns {boolean} - True if nodes overlap, false if they do not.
 */
export const isNodeColliding = (node1, node2, gridSize, allowContact) => {
  const { width: firstWidth, height: firstHeight } = getWidthHeight(node1);
  const { width: secondWidth, height: secondHeight } = getWidthHeight(node2);
  return (
    node1 &&
    node2 &&
    node1.x < node2.x + (allowContact ? 0 : gridSize / 2) + secondWidth &&
    node2.x < node1.x + (allowContact ? 0 : gridSize / 2) + firstWidth &&
    node1.y < node2.y + (allowContact ? 0 : gridSize / 2) + secondHeight &&
    node2.y < node1.y + (allowContact ? 0 : gridSize / 2) + firstHeight
  );
};

/**
 * Rounds number to nearest interval. Returns number if interval is 0.
 * @param {number} number - The number to round.
 * @param {number} interval - The interval to round the number to.
 * @returns {number} - The rounded number, or the number if interval is 0.
 */
export const roundToNearest = (number, interval) =>
  interval ? Math.round(number / interval) * interval : number;

/**
 * Sets the node that has matching id to end of array, making it the top
 * element in the svg. Returns a new array with matching node as last item.
 * @param {string} id - The id to match.
 * @param {Array.<Object>} nodes - Unsorted array of nodes.
 * @returns {Array.<Object>} - Sorted array of nodes.
 */
export const nodeToFront = (id, nodes) => {
  const sortNodes = nodes.slice();
  return sortNodes.sort((a, b) => (a.id === id ? 1 : b.id === id ? -1 : 0));
};

/**
 * Find the coordinates of a node's midpoint.
 * @param {Object} node - Node to find midpoint of.
 * @param {number} gridSize - Grid size for rounding, no rounding if none given.
 * @returns {{x: number, y: number}} - Coordinates of node's midpoint.
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
 * @param {Object} intersectPoint - Point suspected of being within a node.
 * @param {Object} nextPoint - Next-closest edge point.
 * @param {Object} node - Node to find side-point of.
 * @returns {{x: number, y: number}} - Intersect, or center if none found.
 */
export const getEdgeNodeIntersection = (intersectPoint, nextPoint, node) => {
  const e = [intersectPoint.x, intersectPoint.y, nextPoint.x, nextPoint.y];
  const { x: nx, y: ny } = node;
  const { width: nw, height: nh } = getWidthHeight(node);
  // prettier-ignore
  return (
    lineIntersect(...e,      nx,      ny,      nx, ny + nh) || // Left edge.
    lineIntersect(...e, nx + nw,      ny, nx + nw, ny + nh) || // Right edge.
    lineIntersect(...e,      nx,      ny, nx + nw,      ny) || // Top edge.
    lineIntersect(...e,      nx, ny + nh, nx + nw, ny + nh) || // Bottom edge.
    {                                                          // Default.
      x: intersectPoint.x,
      y: intersectPoint.y,
    }
  );
};

/**
 * If node has shape property, returns width and height of shape. Else returns
 * node's width and height.
 * @todo This will actually reference the type of the node for width and height.
 * @param {Object} node
 * @returns {{width, height}}
 */
export const getWidthHeight = node => {
  // const {width, height} = node.hasOwnProperty('shape')
  //     ? ShapeParameters[node.shape]
  //     : node;
  // return {width, height};
};

/**
 * Find intersect between two lines if it exists.
 * Line 1:
 * @param {number} x1 - Point A, X-coordinate.
 * @param {number} y1 - Point A, Y-coordinate.
 * @param {number} x2 - Point B, X-coordinate.
 * @param {number} y2 - Point B, Y-coordinate.
 * Line 2:
 * @param {number} x3 - Point A, X-coordinate.
 * @param {number} y3 - Point A, Y-coordinate.
 * @param {number} x4 - Point B, X-coordinate.
 * @param {number} y4 - Point B, Y-coordinate.
 * @returns {{x: number, y: number}|null} - Return intersect or null if none.
 */
export const lineIntersect = (x1, y1, x2, y2, x3, y3, x4, y4) => {
  const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  if (denom) {
    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
    const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
    return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1
      ? { x: x1 + ua * (x2 - x1), y: y1 + ua * (y2 - y1) }
      : null;
  }
  return null;
};

/**
 * Creates sequential IDs with a given prefix.
 * @param {string} prefix - Prefix for IDs returned from iterator.
 * @returns {function(): string} - The ID iterator.
 */
const nextIdIterator = prefix => {
  let nextId = 1;
  return () => `${prefix}-${nextId++}`;
};
// export const getNextNodeId = nextIdIterator('node');
export const getNextEdgeId = nextIdIterator('edge');
