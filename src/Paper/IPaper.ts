import { INode, INodeProps } from '../Node/INode';
import { IEdge, IEdgeProps } from '../Edge/IEdge';

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

export interface IPaper {
  getPaperElement(): HTMLElement;
  addNode(node: IPaperInputNode): void;
  removeNode(id: string): void;
  updateNode(id: string, newProps: INodeProps): void;
  addEdge(edge: IPaperInputEdge): void;
  removeEdge(id: string): void;
  updateEdge(id: string, newProps: IEdgeProps): void;
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
