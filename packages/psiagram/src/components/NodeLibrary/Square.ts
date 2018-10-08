/**
 * Copyright (c) 2017-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  createSVGWithAttributes,
  roundToNearest,
  setBatchSVGAttribute,
  PaperError,
} from '../../';
import { TextNode, ITextNodeProperties } from './TextNode';

interface ISquareProperties extends ITextNodeProperties {
  length: number;
}

export class Square extends TextNode {
  protected _properties: ISquareProperties;

  constructor(properties: ISquareProperties) {
    super(properties);
    this._properties = properties;
  }

  protected transformProperties(
    properties: ISquareProperties,
  ): ISquareProperties {
    this._growthUnit = properties.gridSize * 2;

    return {
      ...properties,
      length: roundToNearest(
        properties.length,
        this._growthUnit,
        this._growthUnit,
      ),
      title: properties.title || '',
    };
  }

  protected initialize(): void {
    const { length, id } = this._properties;

    this._shape = createSVGWithAttributes('rect', {
      id: id + '_shape',
      width: length,
      height: length,
      fill: 'lightblue',
      stroke: '#333',
      'stroke-width': 1,
    });

    this._group.appendChild(this._shape);

    super.initialize();
  }

  /** Length get + set. */
  get width(): number {
    return this._properties.length;
  }
  get height(): number {
    return this._properties.length;
  }
  set length(length: number) {
    if (this._shape) {
      length = roundToNearest(length, this._growthUnit, this._growthUnit);
      this._properties.length = length;
      setBatchSVGAttribute(this._shape, { height: length, width: length });
      this.updateTextPosition();
    } else {
      throw new PaperError(
        'E_NO_ELEM',
        `No shape exists for Node ID: ${this._properties.id}`,
        'Node.base.ts',
        'set height',
      );
    }
  }
}
