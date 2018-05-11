import { INode, INodeProps } from '../Node/INode';
import { IEdge, IEdgeProps } from '../Edge/IEdge';

export interface IPaper {
  /**
   * Get the paper element.
   */
  getPaperElement(): HTMLElement;

  /**
   * Add a node to the paper.
   */
  addNode(node: IPaperInputNode): void;

  /**
   * Remove a node by ID from the paper.
   */
  removeNode(id: string): void;

  /**
   * Update a node with newProps by ID on the paper.
   */
  updateNode(id: string, newProps: INodeProps): void;

  /**
   * Add an edge to the paper.
   */
  addEdge(edge: IPaperInputEdge): void;

  /**
   * Remove an edge by ID from the paper.
   */
  removeEdge(id: string): void;

  /**
   * Update an edge with newProps by ID on the paper.
   */
  updateEdge(id: string, newProps: IEdgeProps): void;

  /**
   * Initialize on-click listeners. This is only necessary if the component has
   * had uninit called previously, as listeners are initialized in constructor.
   *
   * @todo: Is this necessary?
   */
  init(): void;

  /**
   * Removes any listeners from the component.
   *
   * @todo: Is this necessary?
   */
  uninit(): void;
}

export interface IPaperProps {
  width: string;
  height: string;
  plugins?: Array<Object>;
  attributes?: {
    gridSize?: number;
    allowBlockOverlap?: boolean;
    gridColor?: string;
    paperWrapperClass?: string;
    paperClass?: string;
  };
  initialConditions?: {
    nodes?: Array<IPaperInputNode>;
    edges?: Array<IPaperInputEdge>;
  };
}

export interface IPaperInputNode {
  id: string;
  component: any;
  props: INodeProps;
  coords: { x: number; y: number };
}

export interface IPaperStoredNode {
  id: string;
  coords: { x: number; y: number };
  params: { width: number; height: number };
  instance: INode;
  ref: SVGElement;
}

export interface IPaperInputEdge {
  id: string;
  component: any;
  source: { id: string };
  target: { id: string };
  props: IEdgeProps;
  coords: Array<{ x: number; y: number }>;
}

export interface IPaperStoredEdge {
  id: string;
  source: { id: string };
  target: { id: string };
  coords: Array<{ x: number; y: number }>;
  instance: IEdge;
  ref: SVGElement;
}
