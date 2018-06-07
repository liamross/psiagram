import { Node } from '../Node';
import { Edge } from '../Edge';
import { WorkflowType } from '../../utilities/dataUtils';
import { ICoordinates, IParameters } from '../../common/types';

// =============================================================================
// Paper

export interface IPaperProperties {
  width: number;
  height: number;
  plugins?: Array<{}>;
  attributes?: {
    gridSize?: number;
    allowBlockOverlap?: boolean;
    gridColor?: string;
    paperWrapperClass?: string;
    paperClass?: string;
  };
  initialConditions?: {
    nodes?: IPaperInputNode[];
    edges?: IPaperInputEdge[];
  };
}

export declare type paperEventType =
  // Node
  | 'add-node'
  | 'update-node'
  | 'move-node'
  | 'remove-node'
  // Edge
  | 'add-edge'
  | 'update-edge'
  | 'move-edge'
  | 'remove-edge'
  // Paper
  | 'update-active-item';

export declare type listenerFunction = (env: {}, data: {}) => any;

// =============================================================================
// Active Item

export interface IActiveItem {
  workflowType: WorkflowType;
  id: string;
  paperItemState: PaperItemState;
  [key: string]: string;
}

export enum PaperItemState {
  Moving = 'moving',
  Selected = 'selected',
  Default = 'default',
}

// =============================================================================
// Node

export interface IPaperInputNode {
  id: string;
  component: typeof Node;
  properties: IPaperNodeProperties;
  coords: ICoordinates;
}

export interface IPaperNodeProperties {
  title: string;
  width: number;
  height: number;
}

export interface IPaperNodeUpdateProperties {
  title?: string;
  width?: number;
  height?: number;
}

export interface IPaperStoredNode {
  id: string;
  coords: ICoordinates;
  params: IParameters;
  instance: Node;
  ref: SVGElement;
}

// =============================================================================
// Edge

export interface IPaperInputEdge {
  id: string;
  component: typeof Edge;
  source: { id: string };
  target: { id: string };
  properties: IPaperEdgeProperties;
  coords: ICoordinates[];
}

export interface IPaperEdgeProperties {
  title: string;
}

export interface IPaperEdgeUpdateProperties {
  title?: string;
}

export interface IPaperStoredEdge {
  id: string;
  source: { id: string };
  target: { id: string };
  coords: ICoordinates[];
  instance: Edge;
  ref: SVGElement;
}
