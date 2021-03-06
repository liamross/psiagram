/**
 * Copyright (c) 2017-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { PsiagramPlugin, ICoordinates } from '../../common';
import { BaseNode, IBaseNodeProperties } from '../Node';
import { BaseEdge, IBaseEdgeProperties } from '../Edge';
import { ElementType } from '../../utilities';

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
    nodeComponentMap?: INodeComponentMap;
    edges?: IPaperInputEdge[];
    edgeComponentMap?: IEdgeComponentMap;
  };
}

export interface INodeComponentMap {
  [key: string]: typeof BaseNode;
}

export interface IEdgeComponentMap {
  [key: string]: typeof BaseEdge;
}

export enum PaperEventType {
  AddNode = 'add-node',
  MoveNode = 'move-node',
  RemoveNode = 'remove-node',
  AddEdge = 'add-edge',
  MoveEdge = 'move-edge',
  RemoveEdge = 'remove-edge',
  PaperInit = 'paper-init',
  UpdateActiveItem = 'update-active-item',
}

// =============================================================================
// Active Item

export interface IActiveItem {
  elementType: ElementType;
  id: string;
  isSelected: boolean;
  [key: string]: any;
}

// =============================================================================
// Node

export interface IPaperInputNode {
  id: string;
  component: string;
  coords: ICoordinates;
  properties?: IBaseNodeProperties;
}

export interface IPaperStoredNode {
  id: string;
  coords: ICoordinates;
  instance: PaperNode;
}

export declare class PaperNode extends BaseNode<IBaseNodeProperties> {
  public coords: ICoordinates;
}

// =============================================================================
// Edge

export interface IPaperInputEdge {
  id: string;
  component: string;
  source: edgeEndPoint;
  target: edgeEndPoint;
  coords: ICoordinates[];
  properties?: IBaseEdgeProperties;
}

export interface IPaperStoredEdge {
  id: string;
  source: edgeEndPoint;
  target: edgeEndPoint;
  coords: ICoordinates[];
  instance: PaperEdge;
}

export declare class PaperEdge extends BaseEdge<IBaseEdgeProperties> {
  public source: edgeEndPoint;
  public target: edgeEndPoint;
  public coords: ICoordinates[];
}

export type edgeEndPoint = { id: string } | ICoordinates;
