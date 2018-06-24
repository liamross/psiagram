/**
 * Copyright (c) 2017-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  Node,
  Edge,
  PaperEvent,
  ICoordinates,
  IParameters,
  PsiagramPlugin,
  WorkflowType,
} from '../../';

// =============================================================================
// Paper

export interface IPaperProperties {
  width: number;
  height: number;
  plugins?: PsiagramPlugin[];
  attributes?: {
    gridSize?: number;
    allowBlockOverlap?: boolean;
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
  | 'move-node'
  | 'remove-node'
  // Edge
  | 'add-edge'
  | 'move-edge'
  | 'remove-edge'
  // Paper
  | 'update-active-item';

export declare type listenerFunction = (evt: PaperEvent) => any;

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
  title?: string;
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
  instance: Node;
}

// =============================================================================
// Edge

export interface IPaperInputEdge {
  id: string;
  component: typeof Edge;
  source: { id: string };
  target: { id: string };
  properties?: IPaperEdgeProperties;
  coords: ICoordinates[];
}

export interface IPaperEdgeProperties {
  title?: string;
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
}
