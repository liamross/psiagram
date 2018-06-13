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
  plugins: PsiagramPlugin[];
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
  /**
   * Use the constructor to initialize the plugin before passing it into the
   * Paper. This allows any options to be set prior to it being initialized.
   */
  constructor();
  /**
   * Initialize is called from within the paper. This allows the plugin to hook
   * in and begin manipulating the paper instance. This should ONLY be used
   * internally by the paper.
   *
   * This method is marked as optional, as in some cases you may want to
   * initialize a plugin from another plugin. Use this CAREFULLY.
   *
   * @param paper Instance of the paper that is initializing the plugin.
   * @param nodes Object containing the nodes within the paper.
   * @param edges Object containing the edges within the paper.
   * @param properties All of the properties that the paper is initialized with.
   */
  public initialize?(
    paper: Paper,
    nodes: { [key: string]: IPaperStoredNode },
    edges: { [key: string]: IPaperStoredEdge },
    properties: IPluginProperties,
  ): void;
  /**
   * This may be called if the paper is gracefully torn-down. Use this to clean
   * up any listeners or call any end-of-lifecycle callbacks.
   *
   * This method is marked as optional, as in some cases you may want to
   * tear-down a plugin from another plugin. Use this CAREFULLY.
   */
  public teardown?(): void;
}
