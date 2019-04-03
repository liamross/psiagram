/**
 * Copyright (c) 2017-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { IPaperProperties, PaperEventType } from '../Paper.types';
import { Paper } from '../';
import { Rectangle, BaseNode, IRectangleProperties } from '../../Node';
import { BaseEdge, TextLine, ITextLineProperties } from '../../Edge';
import { PaperEvent } from '../../PaperEvent';
import { ElementType } from '../../../utilities';

let paperProperties: IPaperProperties = null;
let myPaper: Paper = null;

const addNode = () => {
  if (myPaper) {
    myPaper.addNode({
      id: 'node-test',
      component: 'rectangle',
      coords: { x: 900, y: 800 },
      properties: {
        width: 80,
        height: 80,
        title: 'node test',
      } as IRectangleProperties,
    });
  }
};

const addEdge = () => {
  if (myPaper) {
    myPaper.addEdge({
      id: 'edge-test',
      component: 'text-line',
      source: { id: 'node1' },
      target: { id: 'node2' },
      coords: [],
      properties: { title: 'edge test' } as ITextLineProperties,
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
            properties: {
              width: 80,
              height: 80,
              title: 'node 1',
            } as IRectangleProperties,
          },
          {
            id: 'node2',
            component: 'rectangle',
            coords: { x: 240, y: 80 },
            properties: {
              width: 80,
              height: 80,
              title: 'node 2',
            } as IRectangleProperties,
          },
        ],
        nodeComponentMap: {
          rectangle: Rectangle as typeof BaseNode,
        },
        edges: [
          {
            id: 'edge1',
            component: 'text-line',
            source: { id: 'node1' },
            target: { id: 'node2' },
            coords: [],
            properties: { title: 'edge 1' } as ITextLineProperties,
          },
        ],
        edgeComponentMap: {
          'text-line': TextLine as typeof BaseEdge,
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

      myPaper.addListener(PaperEventType.AddNode, testFunc);
      myPaper.addListener(PaperEventType.AddNode, testFunc);

      addNode();

      // A single call to the listener.
      expect(testFunc.mock.calls.length).toBe(1);

      const paperRef = (testFunc.mock.calls[0][0] as PaperEvent<PaperEventType.AddNode>).paper;

      // Only one listener added to 'add-node'.
      // @ts-ignore
      expect(paperRef._listeners[PaperEventType.AddNode].length).toBe(1);

      // The listener is testFunc.
      // @ts-ignore
      expect(paperRef._listeners[PaperEventType.AddNode][0]).toBe(testFunc);
    });
  });

  describe('add node', () => {
    it('can add valid listeners', () => {
      const testFunc = jest.fn();

      myPaper.addListener(PaperEventType.AddNode, testFunc);

      addNode();

      expect(testFunc.mock.calls.length).toBe(1);
    });

    it('can remove listeners', () => {
      const testFunc = jest.fn();

      myPaper.addListener(PaperEventType.AddNode, testFunc);
      myPaper.removeListener(PaperEventType.AddNode, testFunc);

      addNode();

      expect(testFunc.mock.calls.length).toBe(0);
    });
  });

  describe('move node', () => {
    it('can add valid listeners', () => {
      const testFunc = jest.fn();

      myPaper.addListener(PaperEventType.MoveNode, testFunc);

      addNode();

      const node = myPaper.getNode('node-test');
      node.coords = { x: 0, y: 0 };

      expect(testFunc.mock.calls.length).toBe(1);
    });

    it("is not called if node doesn't move in grid", () => {
      const testFunc = jest.fn();

      myPaper.addListener(PaperEventType.MoveNode, testFunc);

      addNode();

      const node = myPaper.getNode('node-test');
      node.coords = { x: 901, y: 901 };

      expect(testFunc.mock.calls.length).toBe(1);
    });

    it('can remove listeners', () => {
      const testFunc = jest.fn();

      myPaper.addListener(PaperEventType.MoveNode, testFunc);
      myPaper.removeListener(PaperEventType.MoveNode, testFunc);

      addNode();

      const node = myPaper.getNode('node-test');
      node.coords = { x: 0, y: 0 };

      expect(testFunc.mock.calls.length).toBe(0);
    });
  });

  describe('remove node', () => {
    it('can add valid listeners', () => {
      const testFunc = jest.fn();

      myPaper.addListener(PaperEventType.RemoveNode, testFunc);

      addNode();

      myPaper.removeNode('node-test');

      expect(testFunc.mock.calls.length).toBe(1);
    });

    it('can remove listeners', () => {
      const testFunc = jest.fn();

      myPaper.addListener(PaperEventType.RemoveNode, testFunc);
      myPaper.removeListener(PaperEventType.RemoveNode, testFunc);

      addNode();

      myPaper.removeNode('node-test');

      expect(testFunc.mock.calls.length).toBe(0);
    });
  });

  describe('add edge', () => {
    it('can add valid listeners', () => {
      const testFunc = jest.fn();

      myPaper.addListener(PaperEventType.AddEdge, testFunc);

      addEdge();

      expect(testFunc.mock.calls.length).toBe(1);
    });

    it('can remove listeners', () => {
      const testFunc = jest.fn();

      myPaper.addListener(PaperEventType.AddEdge, testFunc);
      myPaper.removeListener(PaperEventType.AddEdge, testFunc);

      addEdge();

      expect(testFunc.mock.calls.length).toBe(0);
    });
  });

  describe('update edge position', () => {
    it('can add valid listeners', () => {
      const testFunc = jest.fn();

      myPaper.addListener(PaperEventType.MoveEdge, testFunc);

      addEdge();

      const edge = myPaper.getEdge('edge-test');
      edge.coords = [{ x: 0, y: 0 }];

      expect(testFunc.mock.calls.length).toBe(2);
    });

    it('can remove listeners', () => {
      const testFunc = jest.fn();

      myPaper.addListener(PaperEventType.MoveEdge, testFunc);
      myPaper.removeListener(PaperEventType.MoveEdge, testFunc);

      addEdge();

      const edge = myPaper.getEdge('edge-test');
      edge.coords = [{ x: 0, y: 0 }];

      expect(testFunc.mock.calls.length).toBe(0);
    });
  });

  describe('remove edge', () => {
    it('can add valid listeners', () => {
      const testFunc = jest.fn();

      myPaper.addListener(PaperEventType.RemoveEdge, testFunc);

      addEdge();

      myPaper.removeEdge('edge-test');

      expect(testFunc.mock.calls.length).toBe(1);
    });

    it('can remove listeners', () => {
      const testFunc = jest.fn();

      myPaper.addListener(PaperEventType.RemoveEdge, testFunc);
      myPaper.removeListener(PaperEventType.RemoveEdge, testFunc);

      addEdge();

      myPaper.removeEdge('edge-test');

      expect(testFunc.mock.calls.length).toBe(0);
    });
  });

  describe('update active item', () => {
    it('can add valid listeners', () => {
      const testFunc = jest.fn();

      myPaper.addListener(PaperEventType.UpdateActiveItem, testFunc);

      myPaper.updateActiveItem({
        id: 'test-node',
        isSelected: true,
        elementType: ElementType.Node,
      });

      expect(testFunc.mock.calls.length).toBe(1);
    });

    it('calls even if active item remains the same', () => {
      const testFunc = jest.fn();

      myPaper.addListener(PaperEventType.UpdateActiveItem, testFunc);

      myPaper.updateActiveItem({
        id: 'test-node',
        isSelected: false,
        elementType: ElementType.Node,
      });

      expect(testFunc.mock.calls.length).toBe(1);

      myPaper.updateActiveItem({
        id: 'test-node',
        isSelected: true,
        elementType: ElementType.Node,
      });

      expect(testFunc.mock.calls.length).toBe(2);
    });

    it('does not call if active item remains nothing', () => {
      const testFunc = jest.fn();

      myPaper.addListener(PaperEventType.UpdateActiveItem, testFunc);

      myPaper.updateActiveItem();

      expect(testFunc.mock.calls.length).toBe(0);
    });

    it('can remove listeners', () => {
      const testFunc = jest.fn();

      myPaper.addListener(PaperEventType.UpdateActiveItem, testFunc);
      myPaper.removeListener(PaperEventType.UpdateActiveItem, testFunc);

      myPaper.updateActiveItem();

      expect(testFunc.mock.calls.length).toBe(0);
    });
  });

  describe('paper init', () => {
    it('fires when paper is initialized', () => {
      const testFunc = jest.fn();

      function TestPlugin() {} // tslint:disable-line
      TestPlugin.prototype.initialize = (paper: Paper) => {
        paper.addListener(PaperEventType.PaperInit, testFunc);
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
