import { IPaperStoredNode } from '../../components/Paper';
import {
  isNodeColliding,
  roundToNearest,
  getNodeMidpoint,
  getEdgeNodeIntersection,
  areCoordsEqual,
} from '../workflowUtils';
import { Node } from '../..';

/** Helpers */

const generateNode = (
  id: string,
  x = 0,
  y = 0,
  width = 80,
  height = 80,
): IPaperStoredNode => {
  const xmlns = 'http://www.w3.org/2000/svg';
  const ns = document.createElementNS(xmlns, 'g');
  return {
    id,
    coords: { x, y },
    params: { width, height },
    instance: new Node({ id, title: '', width, height, gridSize: 1 }),
    ref: ns,
  };
};

/** Tests */

describe('Workflow Utilities', () => {
  describe('isNodeColliding', () => {
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
    });

    it('preserves number if interval is not given', () => {
      expect(roundToNearest(20)).toBe(20);
    });

    it('rounds 15 to 16 if interval is 8', () => {
      expect(roundToNearest(15, 8)).toBe(16);
    });

    it('rounds 15 to 14 if interval is 7', () => {
      expect(roundToNearest(15, 7)).toBe(14);
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
      const node1 = generateNode('1', 0, 0, 85, 85);
      const intersection = getEdgeNodeIntersection(
        node1,
        { x: 120, y: 40 },
        20,
      );
      expect(intersection).toMatchObject({ x: 85, y: 40 });
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

    it('returns false if coords z value is not equal', () => {
      const coordsA = { x: 150, y: 250, z: 40 };
      const coordsB = { x: 150, y: 250, z: 50 };
      expect(areCoordsEqual(coordsA, coordsB)).toBeFalsy();
    });
  });
});
