import { IPaperStoredNode } from '../../Paper/IPaper';
import {
  isNodeColliding,
  roundToNearest,
  getNodeMidpoint,
} from '../workflowUtils';

/**
 * Helpers
 */

const generateNode = (
  id,
  x = 0,
  y = 0,
  width = 80,
  height = 80,
): IPaperStoredNode => {
  return {
    id,
    coords: { x, y },
    params: { width, height },
    instance: null,
    ref: null,
  };
};

/**
 * Tests
 */

describe('Workflow Utilities', () => {
  /**
   * isNodeColliding
   */
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
  /**
   * roundToNearest
   */
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
  /**
   * roundToNearest
   */
  /**
   * getNodeMidpoint
   */
  describe('getNodeMidpoint', () => {
    it('finds midpoint of a node with no gridSize given', () => {
      const node1 = generateNode('1');
      const midpoint = getNodeMidpoint(node1);
      expect(midpoint).toHaveProperty('x', 40);
      expect(midpoint).toHaveProperty('y', 40);
    });
  });
});
