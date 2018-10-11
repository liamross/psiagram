/**
 * Copyright (c) 2017-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  isNodeColliding,
  roundToNearest,
  getNodeMidpoint,
  getEdgeNodeIntersection,
  areCoordsEqual,
  generateRandomString,
  IPaperStoredNode,
  PaperNode,
  Rectangle,
  edgeLength,
  pointAlongLine,
  getEdgeMidPoint,
} from '../..';

/** Helpers */

const generateNode = (
  id: string,
  x = 0,
  y = 0,
  width = 80,
  height = 80,
  gridSize = 0,
): IPaperStoredNode => {
  const newNode = new Rectangle({
    id,
    gridSize,
    title: '',
    width,
    height,
  }) as unknown;
  Object.defineProperty(newNode, 'coords', {
    value: { x, y },
  });
  const storedNode: IPaperStoredNode = {
    id,
    coords: { x, y },
    instance: newNode as PaperNode,
  };
  return storedNode;
};

/** Tests */

describe('Diagram Utilities', () => {
  describe('isNodeColliding', () => {
    it('returns false if node 1 is not given', () => {
      const node1 = null;
      const node2 = generateNode('2', 80);
      expect(isNodeColliding(node1, node2, 20, true)).toBeFalsy();
    });

    it('returns false if node 2 is not given', () => {
      const node1 = generateNode('1');
      const node2 = null;
      expect(isNodeColliding(node1, node2, 20, true)).toBeFalsy();
    });

    it('returns true if two nodes overlap', () => {
      const node1 = generateNode('1');
      const node2 = generateNode('2', 40);
      expect(isNodeColliding(node1, node2, 20, false)).toBeTruthy();
    });

    it('returns false if two nodes do not overlap', () => {
      const node1 = generateNode('1');
      const node2 = generateNode('2', 120);
      expect(isNodeColliding(node1, node2, 20, false)).toBeFalsy();
    });

    it('returns true if nodes touch while contact is not allowed', () => {
      const node1 = generateNode('1');
      const node2 = generateNode('2', 80);
      expect(isNodeColliding(node1, node2, 20, false)).toBeTruthy();
    });

    it('returns false if nodes touch while contact is allowed', () => {
      const node1 = generateNode('1');
      const node2 = generateNode('2', 80);
      expect(isNodeColliding(node1, node2, 20, true)).toBeFalsy();
    });
  });

  describe('roundToNearest', () => {
    it('preserves number if interval is 0', () => {
      expect(roundToNearest(20, 0)).toBe(20);
      expect(roundToNearest(-20, 0)).toBe(-20);
    });

    it('preserves number if interval is not given', () => {
      expect(roundToNearest(20)).toBe(20);
      expect(roundToNearest(-20)).toBe(-20);
    });

    it('rounds number up to nearest interval if grid is given', () => {
      expect(roundToNearest(15, 8)).toBe(16);
      expect(roundToNearest(-15, 7)).toBe(-14);
    });

    it('rounds number down to nearest interval if interval is given', () => {
      expect(roundToNearest(15, 7)).toBe(14);
      expect(roundToNearest(-15, 8)).toBe(-16);
    });

    it('rounds numbers to next interval above minimum if lower', () => {
      expect(roundToNearest(4, 10, 10)).toBe(10);
      expect(roundToNearest(-4, 10, 10)).toBe(10);
      expect(roundToNearest(1, 10, 1)).toBe(10);
      expect(roundToNearest(-1, 10, 1)).toBe(10);
      expect(roundToNearest(18, 10, 1)).toBe(20);
    });

    it('returns minimum if num is lower and no interval is given', () => {
      expect(roundToNearest(10, undefined, 20)).toBe(20);
      expect(roundToNearest(-10, undefined, 20)).toBe(20);
    });
  });

  describe('getNodeMidpoint', () => {
    it('finds midpoint of a node with no gridSize given', () => {
      const node1 = generateNode('1');
      const midpoint = getNodeMidpoint(node1);
      expect(midpoint).toMatchObject({ x: 40, y: 40 });
    });

    it('rounds midpoint to nearest grid intersection', () => {
      const node1 = generateNode('1', 0, 0, 85, 85);
      const midpoint = getNodeMidpoint(node1, 20);
      expect(midpoint).toMatchObject({ x: 40, y: 40 });
    });
  });

  describe('getEdgeNodeIntersection', () => {
    it('finds intersection with no gridSize given', () => {
      const node1 = generateNode('1');
      const intersection = getEdgeNodeIntersection(node1, { x: 120, y: 120 });
      expect(intersection).toMatchObject({ x: 80, y: 80 });
    });

    it('finds intersection with midpoint rounded to nearest grid', () => {
      const node1 = generateNode('1', 0, 0, 85, 85, 20);
      const intersection = getEdgeNodeIntersection(
        node1,
        { x: 120, y: 40 },
        20,
      );
      expect(intersection).toMatchObject({ x: 80, y: 40 });
    });

    it('reverts to midpoint if nextPoint is within border', () => {
      const node1 = generateNode('1');
      const intersection = getEdgeNodeIntersection(node1, { x: 50, y: 50 });
      expect(intersection).toMatchObject({ x: 40, y: 40 });
    });

    it('reverts to grid-rounded midpoint if nextPoint is within border', () => {
      const node1 = generateNode('1');
      const intersection = getEdgeNodeIntersection(node1, { x: 50, y: 50 }, 30);
      expect(intersection).toMatchObject({ x: 30, y: 30 });
    });

    it('trims edge at node border plus outline if given', () => {
      const node1 = generateNode('1');
      const intersection = getEdgeNodeIntersection(
        node1,
        { x: 40, y: 120 },
        0,
        10,
      );
      expect(intersection).toMatchObject({ x: 40, y: 90 });
    });

    it('reverts to midpoint if nextPoint is within border plus outline', () => {
      const node1 = generateNode('1');
      const intersection = getEdgeNodeIntersection(
        node1,
        { x: 40, y: 85 },
        0,
        10,
      );
      expect(intersection).toMatchObject({ x: 40, y: 40 });
    });

    it('accurately calculates intersection if non-grid nextPoint given', () => {
      const node = generateNode('node1', 40, 420, 120, 80, 20);
      const nextPoint = { x: 469, y: 469 };
      const gridSize = 20;
      const intersection = getEdgeNodeIntersection(node, nextPoint, gridSize);
      expect(intersection).toMatchObject({ x: 160, y: 460 });
    });
  });

  describe('areCoordsEqual', () => {
    it('returns true if coords are equal', () => {
      const coordsA = { x: 150, y: 250 };
      const coordsB = { x: 150, y: 250 };
      expect(areCoordsEqual(coordsA, coordsB)).toBeTruthy();
    });

    it('returns false if coords are not equal', () => {
      const coordsA = { x: 150, y: 250 };
      const coordsB = { x: 150, y: 150 };
      expect(areCoordsEqual(coordsA, coordsB)).toBeFalsy();
    });

    it('returns true if coords are equal with z', () => {
      const coordsA = { x: 150, y: 250, z: 40 };
      const coordsB = { x: 150, y: 250, z: 40 };
      expect(areCoordsEqual(coordsA, coordsB)).toBeTruthy();
    });
  });

  describe('generateRandomString', () => {
    it('generates strings of the proper length', () => {
      expect(generateRandomString(4).length).toBe(4);
      expect(generateRandomString(8).length).toBe(8);
    });
  });

  describe('getEdgeMidPoint', () => {
    it('finds the midpoint of a straight line', () => {
      const coordinates = [{ x: 1, y: 1 }, { x: 7, y: 9 }];
      expect(getEdgeMidPoint(coordinates)).toEqual({ x: 4, y: 5 });
    });

    it('finds the midpoint of a complex line', () => {
      const coordinates = [
        { x: 0, y: 0 },
        { x: 0, y: 5 }, // + 5px hypotenuse (halfway along this line)
        { x: 5, y: 5 }, // + 5px hypotenuse (halfway along this line)
        { x: 2, y: 9 }, // + 5px hypotenuse
      ];
      expect(getEdgeMidPoint(coordinates)).toEqual({ x: 2.5, y: 5 });
    });

    it('returns midpoint of no-length line', () => {
      const coord = { x: 5, y: 5 };
      const coordinates = [coord, coord];
      expect(getEdgeMidPoint(coordinates)).toEqual(coord);
    });
  });

  describe('edgeLength', () => {
    it('finds the length of a straight line', () => {
      const source = { x: 0, y: 0 };
      const target = { x: 3, y: 4 };
      const coordinates = [source, target];
      expect(edgeLength(coordinates)).toBe(5);
    });

    it('finds the length of a complex line', () => {
      const source = { x: 0, y: 0 };
      const coords = [{ x: 0, y: 5 }, { x: 5, y: 5 }];
      const target = { x: 5, y: 10 };
      const coordinates = [source, ...coords, target];
      expect(edgeLength(coordinates)).toBe(15);
    });

    it('finds the length of a no-length line', () => {
      const source = { x: 0, y: 0 };
      const target = { x: 0, y: 0 };
      const coordinates = [source, target];
      expect(edgeLength(coordinates)).toBe(0);
    });
  });

  describe('pointAlongLine', () => {
    it('returns first point if given negative distance', () => {
      const point1 = { x: 0, y: 0 };
      const point2 = { x: 3, y: 4 };
      const length = -1;
      expect(pointAlongLine(point1, point2, length)).toEqual(point1);
    });

    it('returns first point if given 0 distance', () => {
      const point1 = { x: 0, y: 0 };
      const point2 = { x: 3, y: 4 };
      const length = 0;
      expect(pointAlongLine(point1, point2, length)).toEqual(point1);
    });

    it('returns second point if given distance greater than hypotenuse', () => {
      const point1 = { x: 0, y: 0 };
      const point2 = { x: 3, y: 4 };
      const length = 6;
      expect(pointAlongLine(point1, point2, length)).toEqual(point2);
    });

    it('returns point along a line', () => {
      const point1 = { x: 1, y: 1 };
      const point2 = { x: 7, y: 9 };
      const length = 5;
      expect(pointAlongLine(point1, point2, length)).toEqual({ x: 4, y: 5 });
    });

    it('returns point along a line if second point is <x and <y', () => {
      const point1 = { x: 7, y: 9 };
      const point2 = { x: 1, y: 1 };
      const length = 4;
      expect(pointAlongLine(point1, point2, length)).toEqual({
        x: 4.6,
        y: 5.8,
      });
    });

    it('returns point along a no-length line', () => {
      const point1 = { x: 1, y: 1 };
      const point2 = { x: 1, y: 1 };
      const length = 5;
      expect(pointAlongLine(point1, point2, length)).toEqual({ x: 1, y: 1 });
    });
  });
});
