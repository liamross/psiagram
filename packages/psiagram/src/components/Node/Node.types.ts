/**
 * Copyright (c) 2017-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export interface INodeProperties {
  id: string;
  title: string;
  width: number;
  height: number;
  gridSize: number;
}

export interface INodeUpdateProperties {
  id?: string;
  title?: string;
  width?: number;
  height?: number;
  gridSize?: number;
}
