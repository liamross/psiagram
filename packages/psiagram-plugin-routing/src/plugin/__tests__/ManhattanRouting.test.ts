/**
 * Copyright (c) 2018-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Node, IPaperStoredNode, PaperNode, ICoordinates } from 'psiagram';
import { ManhattanRouting, IBoundingBox, Direction } from '../ManhattanRouting';

let myRouting: ManhattanRouting = null;

/** Helpers */

const generateNode = (
  id: string,
  x = 0,
  y = 0,
  width = 80,
  height = 80,
  gridSize = 0,
): IPaperStoredNode => {
  const newNode = new Node({
    id,
    gridSize,
    title: '',
    width,
    height,
  });
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

const generateSubPoints = (
  coordsA: ICoordinates,
  coordsB: ICoordinates,
  hasSourceBox: boolean = true,
  hasTargetBox: boolean = true,
  prevDirection: Direction = null,
) => {
  const bufferSize = 20;
  const nodeWidth = 40;
  const nodeHeight = 40;

  const sourcePoint: ICoordinates = coordsA;
  const targetPoint: ICoordinates = coordsB;
  const sourceBox: IBoundingBox | null = hasSourceBox
    ? {
        top: sourcePoint.y - bufferSize,
        bottom: sourcePoint.y + nodeHeight + bufferSize,
        left: sourcePoint.x - bufferSize,
        right: sourcePoint.x + nodeWidth + bufferSize,
      }
    : null;
  const targetBox: IBoundingBox | null = hasTargetBox
    ? {
        top: targetPoint.y - bufferSize,
        bottom: targetPoint.y + nodeHeight + bufferSize,
        left: targetPoint.x - bufferSize,
        right: targetPoint.x + nodeWidth + bufferSize,
      }
    : null;

  // @ts-ignore
  return myRouting._getSubPoints(
    sourcePoint,
    targetPoint,
    sourceBox,
    targetBox,
    prevDirection,
  );
};

/** Tests */

beforeEach(() => {
  myRouting = new ManhattanRouting();
});

afterEach(() => {
  myRouting = null;
});

describe('Manhattan Routing', () => {
  describe('get bounding box', () => {
    it('generates a bounding box one grid length around node.', () => {
      const node = generateNode('1', 20, 20, 80, 40, 20);
      // @ts-ignore
      const boundingBox = myRouting._getBoundingBox(node, null, 20);
      expect(boundingBox).toMatchObject({
        top: 0,
        bottom: 80,
        left: 0,
        right: 120,
      });
    });

    it('generates a bounding box one grid length around point.', () => {
      // @ts-ignore
      const boundingBox = myRouting._getBoundingBox(
        null,
        { x: 200, y: 100 },
        20,
      );
      expect(boundingBox).toMatchObject({
        top: 80,
        bottom: 120,
        left: 180,
        right: 220,
      });
    });
  });

  describe('get sub points', () => {
    describe('source to target', () => {
      describe('nodes are colliding', () => {
        it('exits from bottom if source is lower', () => {
          const sourcePoint: ICoordinates = { x: 100, y: 120 };
          const targetPoint: ICoordinates = { x: 120, y: 100 };
          const subPoints = generateSubPoints(sourcePoint, targetPoint);
          expect(subPoints.coords.length).toBe(2);
          expect(subPoints.coords[0]).toMatchObject({ x: 100, y: 180 });
          expect(subPoints.coords[1]).toMatchObject({ x: 120, y: 180 });
        });

        it('exits from top if source is higher', () => {
          const sourcePoint: ICoordinates = { x: 100, y: 120 };
          const targetPoint: ICoordinates = { x: 120, y: 140 };
          const subPoints = generateSubPoints(sourcePoint, targetPoint);
          expect(subPoints.coords.length).toBe(2);
          expect(subPoints.coords[0]).toMatchObject({ x: 100, y: 100 });
          expect(subPoints.coords[1]).toMatchObject({ x: 120, y: 100 });
        });
      });

      describe('target is within x-range of sourceBox', () => {
        it('exits from bottom if source is higher', () => {
          const sourcePoint: ICoordinates = { x: 100, y: 120 };
          const targetPoint: ICoordinates = { x: 120, y: 200 };
          const subPoints = generateSubPoints(sourcePoint, targetPoint);
          expect(subPoints.coords.length).toBe(2);
          expect(subPoints.coords[0]).toMatchObject({ x: 100, y: 180 });
          expect(subPoints.coords[1]).toMatchObject({ x: 120, y: 180 });
        });

        it('exits from top if source is lower', () => {
          const sourcePoint: ICoordinates = { x: 100, y: 120 };
          const targetPoint: ICoordinates = { x: 120, y: 0 };
          const subPoints = generateSubPoints(sourcePoint, targetPoint);
          expect(subPoints.coords.length).toBe(2);
          expect(subPoints.coords[0]).toMatchObject({ x: 100, y: 100 });
          expect(subPoints.coords[1]).toMatchObject({ x: 120, y: 100 });
        });
      });

      describe('source is within y-range of targetBox', () => {
        it('exits from right if source is more left', () => {
          const sourcePoint: ICoordinates = { x: 100, y: 120 };
          const targetPoint: ICoordinates = { x: 200, y: 120 };
          const subPoints = generateSubPoints(sourcePoint, targetPoint);
          expect(subPoints.coords.length).toBe(2);
          expect(subPoints.coords[0]).toMatchObject({ x: 160, y: 120 });
          expect(subPoints.coords[1]).toMatchObject({ x: 160, y: 120 });
        });

        it('exits from left if source is more right', () => {
          const sourcePoint: ICoordinates = { x: 100, y: 120 };
          const targetPoint: ICoordinates = { x: 0, y: 120 };
          const subPoints = generateSubPoints(sourcePoint, targetPoint);
          expect(subPoints.coords.length).toBe(2);
          expect(subPoints.coords[0]).toMatchObject({ x: 80, y: 120 });
          expect(subPoints.coords[1]).toMatchObject({ x: 80, y: 120 });
        });
      });

      it('exits horizontally if no overlap and not within range', () => {
        const sourcePoint: ICoordinates = { x: 100, y: 100 };
        const targetPoint: ICoordinates = { x: 200, y: 200 };
        const subPoints = generateSubPoints(sourcePoint, targetPoint);
        expect(subPoints.coords.length).toBe(1);
        expect(subPoints.coords[0]).toMatchObject({ x: 200, y: 100 });
      });
    });

    describe('source to point', () => {
      it('exits horizontally if target is within y-range of sourceBox', () => {
        const sourcePoint: ICoordinates = { x: 100, y: 100 };
        const targetPoint: ICoordinates = { x: 200, y: 120 };
        const subPoints = generateSubPoints(
          sourcePoint,
          targetPoint,
          true,
          false,
        );
        expect(subPoints.coords.length).toBe(1);
        expect(subPoints.coords[0]).toMatchObject({ x: 200, y: 100 });
      });

      it('exits vertically otherwise', () => {
        const sourcePoint: ICoordinates = { x: 100, y: 100 };
        const targetPoint: ICoordinates = { x: 200, y: 200 };
        const subPoints = generateSubPoints(
          sourcePoint,
          targetPoint,
          true,
          false,
        );
        expect(subPoints.coords.length).toBe(1);
        expect(subPoints.coords[0]).toMatchObject({ x: 100, y: 200 });
      });
    });

    describe('point to point', () => {
      describe('has previous direction', () => {
        it('exits horizontally if previous direction was horizontal', () => {
          const sourcePoint: ICoordinates = { x: 100, y: 100 };
          const targetPoint: ICoordinates = { x: 200, y: 120 };
          const subPoints = generateSubPoints(
            sourcePoint,
            targetPoint,
            false,
            false,
            Direction.Horizontal,
          );
          expect(subPoints.coords.length).toBe(1);
          expect(subPoints.coords[0]).toMatchObject({ x: 200, y: 100 });
        });

        it('exits vertically if previous direction was vertical', () => {
          const sourcePoint: ICoordinates = { x: 100, y: 100 };
          const targetPoint: ICoordinates = { x: 200, y: 200 };
          const subPoints = generateSubPoints(
            sourcePoint,
            targetPoint,
            false,
            false,
            Direction.Vertical,
          );
          expect(subPoints.coords.length).toBe(1);
          expect(subPoints.coords[0]).toMatchObject({ x: 100, y: 200 });
        });
      });

      it('exits horizontally if there is no previous direction', () => {
        const sourcePoint: ICoordinates = { x: 100, y: 100 };
        const targetPoint: ICoordinates = { x: 200, y: 200 };
        const subPoints = generateSubPoints(
          sourcePoint,
          targetPoint,
          false,
          false,
        );
        expect(subPoints.coords.length).toBe(1);
        expect(subPoints.coords[0]).toMatchObject({ x: 200, y: 100 });
      });
    });
  });
});
