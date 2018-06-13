/**
 * Copyright (c) 2017-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  Paper,
  IPaperStoredNode,
  IPaperStoredEdge,
  IPaperInputNode,
  IPaperInputEdge,
} from '../';

export interface IPluginProperties {
  width: number;
  height: number;
  plugins: Array<typeof PsiagramPlugin>;
  /**
   * Attributes are simply values: changing them will not alter the values in
   * Paper. They are simply to pass-through any initial attributes, or the
   * default values set-up in Paper.
   */
  attributes: {
    gridSize: number;
    allowBlockOverlap: boolean;
    gridColor: string;
    paperWrapperClass: string;
    paperClass: string;
  };
  initialConditions?: {
    nodes?: IPaperInputNode[];
    edges?: IPaperInputEdge[];
  };
}

export declare class PsiagramPlugin {
  constructor(
    paper: Paper,
    nodes: { [key: string]: IPaperStoredNode },
    edges: { [key: string]: IPaperStoredEdge },
    properties: IPluginProperties,
  );
  public initialize(): void;
  public teardown(): void;
}
