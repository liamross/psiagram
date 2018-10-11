/**
 * Copyright (c) 2017-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  Node,
  Paper,
  IPaperProperties,
  Edge,
  Rectangle,
  PaperEvent,
  PaperItemState,
  ElementType,
} from '../../..';

let paperProperties: IPaperProperties = null;
let myPaper: Paper = null;

const addNode = () => {
  if (myPaper) {
    myPaper.addNode({
      id: 'node-test',
      component: 'rectangle',
      coords: { x: 900, y: 800 },
      properties: { width: 80, height: 80, title: 'node test' },
    });
  }
};

const addEdge = () => {
  if (myPaper) {
    myPaper.addEdge({
      id: 'edge-test',
      component: 'line',
      source: { id: 'node1' },
      target: { id: 'node2' },
      coords: [],
      properties: { title: 'edge test' },
    });
  }
};

describe('Listeners', () => {
  beforeAll(() => {
    paperProperties = {
      attributes: { gridSize: 20 },
      height: 900,
      width: 1300,
      plugins: [],
      initialConditions: {
        nodes: [
          {
            id: 'node1',
            component: 'rectangle',
            coords: { x: 80, y: 80 },
            properties: { width: 80, height: 80, title: 'node 1' },
          },
          {
            id: 'node2',
            component: 'rectangle',
            coords: { x: 240, y: 80 },
            properties: { width: 80, height: 80, title: 'node 2' },
          },
        ],
        nodeComponentMap: {
          rectangle: Rectangle as typeof Node,
        },
        edges: [
          {
            id: 'edge1',
            component: 'line',
            source: { id: 'node1' },
            target: { id: 'node2' },
            coords: [],
            properties: { title: 'edge 1' },
          },
        ],
        edgeComponentMap: {
          line: Edge,
        },
      },
    };
  });

  beforeEach(() => {
    myPaper = new Paper(paperProperties);
  });

  afterEach(() => {
    myPaper = null;
  });

  describe('all types', () => {
    it('only adds equal listener callback once to same event type', () => {
      const testFunc = jest.fn();

      myPaper.addListener('add-node', testFunc);
      myPaper.addListener('add-node', testFunc);

      addNode();

      // A single call to the listener.
      expect(testFunc.mock.calls.length).toBe(1);

      const paperRef = (testFunc.mock.calls[0][0] as PaperEvent).paper;

      // Only one listener added to 'add-node'.
      // @ts-ignore
      expect(paperRef._listeners['add-node'].length).toBe(1);

      // The listener is testFunc.
      // @ts-ignore
      expect(paperRef._listeners['add-node'][0]).toBe(testFunc);
    });
  });

  describe('add node', () => {
    it('can add valid listeners', () => {
      const testFunc = jest.fn();

      myPaper.addListener('add-node', testFunc);

      addNode();

      expect(testFunc.mock.calls.length).toBe(1);
    });

    it('can remove listeners', () => {
      const testFunc = jest.fn();

      myPaper.addListener('add-node', testFunc);
      myPaper.removeListener('add-node', testFunc);

      addNode();

      expect(testFunc.mock.calls.length).toBe(0);
    });
  });

  describe('move node', () => {
    it('can add valid listeners', () => {
      const testFunc = jest.fn();

      myPaper.addListener('move-node', testFunc);

      addNode();

      const node = myPaper.getNode('node-test');
      node.coords = { x: 0, y: 0 };

      expect(testFunc.mock.calls.length).toBe(1);
    });

    it("is not called if node doesn't move in grid", () => {
      const testFunc = jest.fn();

      myPaper.addListener('move-node', testFunc);

      addNode();

      const node = myPaper.getNode('node-test');
      node.coords = { x: 901, y: 901 };

      expect(testFunc.mock.calls.length).toBe(1);
    });

    it('can remove listeners', () => {
      const testFunc = jest.fn();

      myPaper.addListener('move-node', testFunc);
      myPaper.removeListener('move-node', testFunc);

      addNode();

      const node = myPaper.getNode('node-test');
      node.coords = { x: 0, y: 0 };

      expect(testFunc.mock.calls.length).toBe(0);
    });
  });

  describe('remove node', () => {
    it('can add valid listeners', () => {
      const testFunc = jest.fn();

      myPaper.addListener('remove-node', testFunc);

      addNode();

      myPaper.removeNode('node-test');

      expect(testFunc.mock.calls.length).toBe(1);
    });

    it('can remove listeners', () => {
      const testFunc = jest.fn();

      myPaper.addListener('remove-node', testFunc);
      myPaper.removeListener('remove-node', testFunc);

      addNode();

      myPaper.removeNode('node-test');

      expect(testFunc.mock.calls.length).toBe(0);
    });
  });

  describe('add edge', () => {
    it('can add valid listeners', () => {
      const testFunc = jest.fn();

      myPaper.addListener('add-edge', testFunc);

      addEdge();

      expect(testFunc.mock.calls.length).toBe(1);
    });

    it('can remove listeners', () => {
      const testFunc = jest.fn();

      myPaper.addListener('add-edge', testFunc);
      myPaper.removeListener('add-edge', testFunc);

      addEdge();

      expect(testFunc.mock.calls.length).toBe(0);
    });
  });

  describe('update edge position', () => {
    it('can add valid listeners', () => {
      const testFunc = jest.fn();

      myPaper.addListener('move-edge', testFunc);

      addEdge();

      const edge = myPaper.getEdge('edge-test');
      edge.coords = [{ x: 0, y: 0 }];

      expect(testFunc.mock.calls.length).toBe(2);
    });

    it('can remove listeners', () => {
      const testFunc = jest.fn();

      myPaper.addListener('move-edge', testFunc);
      myPaper.removeListener('move-edge', testFunc);

      addEdge();

      const edge = myPaper.getEdge('edge-test');
      edge.coords = [{ x: 0, y: 0 }];

      expect(testFunc.mock.calls.length).toBe(0);
    });
  });

  describe('remove edge', () => {
    it('can add valid listeners', () => {
      const testFunc = jest.fn();

      myPaper.addListener('remove-edge', testFunc);

      addEdge();

      myPaper.removeEdge('edge-test');

      expect(testFunc.mock.calls.length).toBe(1);
    });

    it('can remove listeners', () => {
      const testFunc = jest.fn();

      myPaper.addListener('remove-edge', testFunc);
      myPaper.removeListener('remove-edge', testFunc);

      addEdge();

      myPaper.removeEdge('edge-test');

      expect(testFunc.mock.calls.length).toBe(0);
    });
  });

  describe('update active item', () => {
    it('can add valid listeners', () => {
      const testFunc = jest.fn();

      myPaper.addListener('update-active-item', testFunc);

      myPaper.updateActiveItem({
        id: 'test-node',
        paperItemState: PaperItemState.Moving,
        elementType: ElementType.Node,
      });

      expect(testFunc.mock.calls.length).toBe(1);
    });

    it('does not call if active item does not change', () => {
      const testFunc = jest.fn();

      myPaper.addListener('update-active-item', testFunc);

      myPaper.updateActiveItem({
        id: 'test-node',
        paperItemState: PaperItemState.Moving,
        elementType: ElementType.Node,
      });

      expect(testFunc.mock.calls.length).toBe(1);

      myPaper.updateActiveItem({
        id: 'test-node',
        paperItemState: PaperItemState.Moving,
        elementType: ElementType.Node,
      });

      expect(testFunc.mock.calls.length).toBe(1);
    });

    it('does not call if active item remains nothing', () => {
      const testFunc = jest.fn();

      myPaper.addListener('update-active-item', testFunc);

      myPaper.updateActiveItem();

      expect(testFunc.mock.calls.length).toBe(0);
    });

    it('can remove listeners', () => {
      const testFunc = jest.fn();

      myPaper.addListener('update-active-item', testFunc);
      myPaper.removeListener('update-active-item', testFunc);

      myPaper.updateActiveItem();

      expect(testFunc.mock.calls.length).toBe(0);
    });
  });

  describe('paper init', () => {
    it('fires when paper is initialized', () => {
      const testFunc = jest.fn();

      function TestPlugin() {} // tslint:disable-line
      TestPlugin.prototype.initialize = (paper: Paper) => {
        paper.addListener('paper-init', testFunc);
      };

      const _ = new Paper({
        height: 900,
        width: 1300,
        plugins: [new TestPlugin()],
      });

      expect(testFunc.mock.calls.length).toBe(1);
    });
  });
});
