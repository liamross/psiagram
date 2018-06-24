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
  coords: ICoordinates;
  properties: {
    width: number;
    height: number;
    title?: string;
  };
}

export interface IPaperStoredNode {
  id: string;
  coords: ICoordinates;
  instance: PaperNode;
}

export declare class PaperNode extends Node {
  public coords: ICoordinates;
}

// =============================================================================
// Edge

export interface IPaperInputEdge {
  id: string;
  component: typeof Edge;
  source: { id: string };
  target: { id: string };
  coords: ICoordinates[];
  properties?: {
    title?: string;
  };
}

export interface IPaperStoredEdge {
  id: string;
  source: { id: string };
  target: { id: string };
  coords: ICoordinates[];
  instance: PaperEdge;
}

export declare class PaperEdge extends Edge {
  public source: { id: string };
  public target: { id: string };
  public coords: ICoordinates[];
}
