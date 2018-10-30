/**
 * Copyright (c) 2017-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { IPaperStoredNode } from '../components/Paper';
import { ICoordinates, IParameters } from '../common';

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
 * @param minimum Lowest possible value. Will round up to interval if given.
 */
export const roundToNearest = (
  num: number,
  interval: number = 0,
  minimum: number = 0,
): number => {
  if (interval) {
    return minimum
      ? Math.max(
          Math.round(num / interval) * interval,
          Math.ceil(minimum / interval) * interval,
        )
      : Math.round(num / interval) * interval;
  } else {
    return minimum ? Math.max(num, minimum) : num;
  }
};

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
 * Order of priority:
 * 1. Left edge.
 * 2. Right edge.
 * 3. Top edge.
 * 4. Bottom edge.
 * 5. Midpoint of node.
 *
 * @param node Node with boundary to trim edge at.
 * @param nextPoint The next point closest to the node center.
 * @param [gridSize] Optional. The size of the grid to snap to.
 * @param [nodeOutline] Optional. Distance in px away from node to trim edge.
 */
export const getEdgeNodeIntersection = (
  node: IPaperStoredNode,
  nextPoint: { x: number; y: number },
  gridSize?: number,
  nodeOutline?: number,
): { x: number; y: number } => {
  const midPoint = getNodeMidpoint(node, gridSize);
  const lineA = [
    midPoint.x,
    midPoint.y,
    roundToNearest(nextPoint.x, gridSize),
    roundToNearest(nextPoint.y, gridSize),
  ];

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
 * Returns node's width and height.
 *
 * @param node The node to find width and height of.
 */
export const getWidthHeight = (node: IPaperStoredNode): IParameters => {
  const params = { width: node.instance.width, height: node.instance.height };
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
) {
  const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  if (denominator) {
    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
    const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;
    return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1
      ? { x: x1 + ua * (x2 - x1), y: y1 + ua * (y2 - y1) }
      : null;
  }
  return null;
}

/**
 * Returns true if all points are equal between two sets of coordinates.
 *
 * @param coordsA First set of coordinates.
 * @param coordsB Second set of coordinates.
 */
export const areCoordsEqual = (
  coordsA: ICoordinates,
  coordsB: ICoordinates,
): boolean => coordsA.x === coordsB.x && coordsA.y === coordsB.y;

/**
 * Generates a string of possible characters at a defined length.
 *
 * @param length The total length of the string.
 * @param useLowerCase Can include both upper and lowercase letters.
 */
export const generateRandomString = (
  length: number,
  useLowerCase: boolean = false,
) => {
  let text = '';

  const possibleLetters = 'bcdghjklmnpqrstvwxyz';
  const possibleNumbers = '0123456789';
  let possibleChars = possibleLetters.toUpperCase() + possibleNumbers;
  if (useLowerCase) possibleChars += possibleLetters;

  for (let i = 0; i < length; i++) {
    text += possibleChars.charAt(
      Math.floor(Math.random() * possibleChars.length),
    );
  }

  return text;
};

/**
 * Returns the midpoint coordinate of an Edge.
 *
 * @param coordinates Array of coordinate points.
 */
export const getEdgeMidPoint = (coordinates: ICoordinates[]): ICoordinates => {
  const half = edgeLength(coordinates) / 2;

  if (half === 0) return coordinates[0];

  let length = 0;
  let index = 0;
  let lengthSegment = 0;

  while (length < half) {
    index++;
    lengthSegment = distanceBetweenPoints(
      coordinates[index - 1],
      coordinates[index],
    );
    length += lengthSegment;
  }

  const lengthDif = length - half;
  const distanceFromPoint1 = lengthSegment - lengthDif;

  return pointAlongLine(
    coordinates[index - 1],
    coordinates[index],
    distanceFromPoint1,
  );
};

/**
 * Returns the total length of an Edge based on an array of coordinate points.
 *
 * @param coordinates Array of coordinate points.
 */
export const edgeLength = (coordinates: ICoordinates[]): number => {
  let length = 0;
  for (let i = 0; i < coordinates.length - 1; i++) {
    length += distanceBetweenPoints(coordinates[i], coordinates[i + 1]);
  }
  return length;
};

/**
 * Returns the distance between two points.
 *
 * @param point1 Initial point.
 * @param point2 Second point.
 */
export const distanceBetweenPoints = (
  point1: ICoordinates,
  point2: ICoordinates,
): number => Math.hypot(point2.x - point1.x, point2.y - point1.y);

/**
 * Returns the coordinate of a point distance away from point1 towards point2.
 * Will only return a coordinate between point1 and point2.
 *
 * @param point1 Point to measure distance from.
 * @param point2 End point of line.
 * @param distance Distance from point1 towards point2.
 */
export const pointAlongLine = (
  point1: ICoordinates,
  point2: ICoordinates,
  distance: number,
): ICoordinates => {
  if (distance <= 0) return point1;
  const lengthHyp = distanceBetweenPoints(point1, point2);
  if (distance >= lengthHyp) return point2;
  const ratio = distance / lengthHyp;
  const lengthX = point2.x - point1.x;
  const lengthY = point2.y - point1.y;
  return { x: point1.x + lengthX * ratio, y: point1.y + lengthY * ratio };
};

/**
 * Returns the distance of a point to the line, as well as the closest point
 * along the line.
 *
 * @param linePoint1 First point of line.
 * @param linePoint2 Second point of line.
 * @param point Point to find distance and closest point along line for.
 */
export const closestPointAlongLine = (
  linePoint1: ICoordinates,
  linePoint2: ICoordinates,
  point: ICoordinates,
): { distance: number; point: ICoordinates } => {
  const { x: x1, y: y1 } = linePoint1;
  const { x: x2, y: y2 } = linePoint2;
  const { x: x0, y: y0 } = point;

  const line = distanceBetweenPoints(linePoint1, linePoint2);
  const lineFrom1 = distanceBetweenPoints(linePoint1, point);
  const lineFrom2 = distanceBetweenPoints(linePoint2, point);

  // If angle from point one is greater or equal to 90 degrees, choose it.
  const angleFrom1 = Math.acos(
    (line ** 2 + lineFrom1 ** 2 - lineFrom2 ** 2) / (2 * line * lineFrom1),
  );
  if (angleFrom1 >= Math.PI / 2) {
    return { distance: lineFrom1, point: linePoint1 };
  }

  // If angle from point two is greater or equal to 90 degrees, choose it.
  const angleFrom2 = Math.acos(
    (line ** 2 + lineFrom2 ** 2 - lineFrom1 ** 2) / (2 * line * lineFrom2),
  );
  if (angleFrom2 >= Math.PI / 2) {
    return { distance: lineFrom2, point: linePoint2 };
  }

  // Find distance from point to line.
  const numerator = Math.abs(
    (y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - y2 * x1,
  );
  const denominator = Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);
  const distance = numerator / denominator;

  // Calculate the distance from line point one that an intersect would be.
  const angleC = Math.PI / 2 - angleFrom1;
  const distanceFrom1 = Math.sqrt(
    lineFrom1 ** 2 +
      distance ** 2 -
      2 * lineFrom1 * distance * Math.cos(angleC),
  );

  return {
    distance,
    point: pointAlongLine(linePoint1, linePoint2, distanceFrom1),
  };
};
