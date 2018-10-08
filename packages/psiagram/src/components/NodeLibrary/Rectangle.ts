/**
 * Copyright (c) 2017-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createSVGWithAttributes, roundToNearest } from '../../';
import { TextNode, ITextNodeProperties } from './TextNode';

interface IRectangleProperties extends ITextNodeProperties {
  width: number;
  height: number;
}

export class Rectangle extends TextNode {
  protected _properties: IRectangleProperties;

  constructor(properties: IRectangleProperties) {
    super(properties);
    this._properties = properties;
  }

  protected transformProperties(
    properties: ITextNodeProperties,
  ): ITextNodeProperties {
    this._growthUnit = properties.gridSize * 2;

    return {
      ...properties,
      width: roundToNearest(
        properties.width,
        this._growthUnit,
        this._growthUnit,
      ),
      height: roundToNearest(
        properties.height,
        this._growthUnit,
        this._growthUnit,
      ),
      title: properties.title || '',
    };
  }

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
