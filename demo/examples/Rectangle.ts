/**
 * Copyright (c) 2017-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createSVGWithAttributes, INodeProperties } from 'psiagram';
import { GenericTextShape } from './GenericTextShape';

interface IRectangleProperties extends INodeProperties {
  width: number;
  height: number;
}

export class Rectangle extends GenericTextShape {
  protected _properties: IRectangleProperties;

  protected initialize(): void {
    const { width, height, id } = this._properties;

    this._shape = createSVGWithAttributes('rect', {
      id: id + '_shape',
      width,
      height,
      fill: '#EAEAEA',
      stroke: '#333',
      'stroke-width': 1,
    });

    this._group.appendChild(this._shape);

    super.initialize();
  }
}
