/**
 * Copyright (c) 2018-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  Node,
  IPaperStoredNode,
  PaperNode,
  IPluginProperties,
  PaperEvent,
  getEdgeNodeIntersection,
} from 'psiagram';
import { ManhattanRouting, IBoundingBox } from '../ManhattanRouting';

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
  });
});
