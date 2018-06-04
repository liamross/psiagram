import { Paper, IPaperProps, Edge, Node, listenerFunction } from '../../..';

let paperProps: IPaperProps = null;
let myPaper: Paper = null;

declare var global: any;

const addNode = () => {
  if (myPaper) {
    myPaper.addNode({
      id: 'node-test',
      component: Node,
      coords: { x: 900, y: 800 },
      props: { width: 80, height: 80, title: 'node test' },
    });
  }
};

const addEdge = () => {
  if (myPaper) {
    myPaper.addEdge({
      id: 'edge-test',
      component: Edge,
      source: { id: 'node1' },
      target: { id: 'node2' },
      coords: [],
      props: { title: 'edge test' },
    });
  }
};

describe('Listeners', () => {
  beforeAll(() => {
    paperProps = {
      attributes: { gridSize: 20 },
      height: '900px',
      width: '1300px',
      plugins: [],
      initialConditions: {
        nodes: [
          {
            id: 'node1',
            component: Node,
            coords: { x: 80, y: 80 },
            props: { width: 80, height: 80, title: 'node 1' },
          },
          {
            id: 'node2',
            component: Node,
            coords: { x: 240, y: 80 },
            props: { width: 80, height: 80, title: 'node 2' },
          },
        ],
        edges: [
          {
            id: 'edge1',
            component: Edge,
            source: { id: 'node1' },
            target: { id: 'node2' },
            coords: [],
            props: { title: 'edge 1' },
          },
        ],
      },
    };
  });

  beforeEach(() => {
    myPaper = new Paper(paperProps);
  });

  afterEach(() => {
    myPaper = null;
  });

  describe('all types', () => {
    it('prohibits adding duplicate listeners to a type', () => {
      const testFunc = jest.fn();

      // TODO: Update once console errors are callback error codes.
      const spy = jest.spyOn(global.console, 'error');

      myPaper.addListener('add-node', testFunc);
      expect(spy).toHaveBeenCalledTimes(0);
      myPaper.addListener('add-node', testFunc);
      expect(spy).toHaveBeenCalledTimes(1);

      addNode();

      // A single call to the listener.
      expect(testFunc.mock.calls.length).toBe(1);

      // Only one listener added to 'add-node'.
      expect(
        (testFunc.mock.calls[0][0] as { [key: string]: any }).listeners[
          'add-node'
        ][0],
      ).toBe(testFunc);
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

  describe('update node props', () => {
    it('can add valid listeners', () => {
      const testFunc = jest.fn();

      myPaper.addListener('update-node', testFunc);

      addNode();

      myPaper.updateNodeProps('node-test', { title: 'new-title' });

      expect(testFunc.mock.calls.length).toBe(1);
    });

    it('can remove listeners', () => {
      const testFunc = jest.fn();

      myPaper.addListener('update-node', testFunc);
      myPaper.removeListener('update-node', testFunc);

      addNode();

      myPaper.updateNodeProps('node-test', { title: 'new-title' });

      expect(testFunc.mock.calls.length).toBe(0);
    });
  });

  describe('move node', () => {
    it('can add valid listeners', () => {
      const testFunc = jest.fn();

      myPaper.addListener('move-node', testFunc);

      addNode();

      myPaper.moveNode('node-test', { x: 0, y: 0 });

      expect(testFunc.mock.calls.length).toBe(1);
    });

    it("is not called if node doesn't move in grid", () => {
      const testFunc = jest.fn();

      myPaper.addListener('move-node', testFunc);

      addNode();

      myPaper.moveNode('node-test', { x: 901, y: 901 });

      expect(testFunc.mock.calls.length).toBe(1);
    });

    it('can remove listeners', () => {
      const testFunc = jest.fn();

      myPaper.addListener('move-node', testFunc);
      myPaper.removeListener('move-node', testFunc);

      addNode();

      myPaper.moveNode('node-test', { x: 0, y: 0 });

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

  describe('update edge props', () => {
    it('can add valid listeners', () => {
      const testFunc = jest.fn();

      myPaper.addListener('update-edge', testFunc);

      addEdge();

      myPaper.updateEdgeProps('edge-test', { title: 'new-title' });

      expect(testFunc.mock.calls.length).toBe(1);
    });

    it('can remove listeners', () => {
      const testFunc = jest.fn();

      myPaper.addListener('update-edge', testFunc);
      myPaper.removeListener('update-edge', testFunc);

      addEdge();

      myPaper.updateEdgeProps('edge-test', { title: 'new-title' });

      expect(testFunc.mock.calls.length).toBe(0);
    });
  });

  describe('update edge position', () => {
    it('can add valid listeners', () => {
      const testFunc = jest.fn();

      myPaper.addListener('move-edge', testFunc);

      addEdge();

      myPaper.updateEdgePosition('edge-test');

      expect(testFunc.mock.calls.length).toBe(2);
    });

    it('can remove listeners', () => {
      const testFunc = jest.fn();

      myPaper.addListener('move-edge', testFunc);
      myPaper.removeListener('move-edge', testFunc);

      addEdge();

      myPaper.updateEdgePosition('edge-test');

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
});
