import { Paper, IPaperProps, Edge, Node, listenerFunction } from '../../..';

let paperProps: IPaperProps = null;
let myPaper: Paper = null;

declare var global: any;

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

      myPaper.addNode({
        id: 'node-test',
        component: Node,
        coords: { x: 900, y: 800 },
        props: { width: 80, height: 80, title: 'node test' },
      });

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

      myPaper.addNode({
        id: 'node-test',
        component: Node,
        coords: { x: 900, y: 800 },
        props: { width: 80, height: 80, title: 'node test' },
      });

      expect(testFunc.mock.calls.length).toBe(1);
    });

    it('can remove listeners', () => {
      const testFunc = jest.fn();

      myPaper.addListener('add-node', testFunc);
      myPaper.removeListener('add-node', testFunc);

      myPaper.addNode({
        id: 'node-test',
        component: Node,
        coords: { x: 900, y: 800 },
        props: { width: 80, height: 80, title: 'node test' },
      });

      expect(testFunc.mock.calls.length).toBe(0);
    });
  });

  describe('add edge', () => {
    it('can add valid listeners', () => {
      const testFunc = jest.fn();

      myPaper.addListener('add-edge', testFunc);

      myPaper.addEdge({
        id: 'edge-test',
        component: Edge,
        source: { id: 'node1' },
        target: { id: 'node2' },
        coords: [],
        props: { title: 'edge test' },
      });

      expect(testFunc.mock.calls.length).toBe(1);
    });

    it('can remove listeners', () => {
      const testFunc = jest.fn();

      myPaper.addListener('add-edge', testFunc);
      myPaper.removeListener('add-edge', testFunc);

      myPaper.addEdge({
        id: 'edge-test',
        component: Edge,
        source: { id: 'node1' },
        target: { id: 'node2' },
        coords: [],
        props: { title: 'edge test' },
      });

      expect(testFunc.mock.calls.length).toBe(0);
    });
  });
});
