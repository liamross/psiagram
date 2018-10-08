/**
 * Copyright (c) 2017-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  createSVGWithAttributes,
  INodeProperties,
  roundToNearest,
  setBatchSVGAttribute,
  PaperError,
} from 'psiagram';
import { GenericTextShape } from './GenericTextShape';

interface ICautionProperties extends INodeProperties {
  length: number;
}

const FONT_HEIGHT = 14;

export class Caution extends GenericTextShape {
  protected _properties: ICautionProperties;

  protected transformProperties(properties: ICautionProperties) {
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

  protected updateTextPosition(): void {
    const { length } = this._properties;

    const fontX = length / 2;
    const fontY = FONT_HEIGHT / 2 + length / 2;

    setBatchSVGAttribute(this._text as SVGElement, { x: fontX, y: fontY });
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
