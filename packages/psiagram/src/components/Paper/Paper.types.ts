/**
 * Copyright (c) 2017-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Node, Edge, ICoordinates, PsiagramPlugin, WorkflowType } from '../../';

// =============================================================================
// Paper

export interface IPaperProperties {
  width: number;
  height: number;
  plugins?: PsiagramPlugin[];
  attributes?: {
    gridSize?: number;
    paperWrapperClass?: string;
    paperClass?: string;
    uniqueId?: string;
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
  | 'paper-init'
  | 'update-active-item';

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
  source: edgeEndPoint;
  target: edgeEndPoint;
  coords: ICoordinates[];
  properties?: {
    title?: string;
  };
}

export interface IPaperStoredEdge {
  id: string;
  source: edgeEndPoint;
  target: edgeEndPoint;
  coords: ICoordinates[];
  instance: PaperEdge;
}

export declare class PaperEdge extends Edge {
  public source: edgeEndPoint;
  public target: edgeEndPoint;
  public coords: ICoordinates[];
}

export declare type edgeEndPoint = { id: string } | ICoordinates;
