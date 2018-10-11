/**
 * Copyright (c) 2017-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TextNode } from '../NodeAbstracts/TextNode';

import {
  createSVGWithAttributes,
  roundToNearest,
  setSVGAttribute,
  ITextNodeProperties,
  PaperError,
} from '../../../';

export interface IRectangleProperties extends ITextNodeProperties {
  width: number;
  height: number;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

export class Rectangle extends TextNode<IRectangleProperties> {
  protected _shape: SVGElement | null;
  private _growthUnit: number;

  constructor(props: IRectangleProperties) {
    super(props);
    this._shape = null;
    this._growthUnit = props.gridSize * 2;

    this.props = {
      ...this.props,
      fillColor: props.fillColor || '#EAEAEA',
      strokeColor: props.strokeColor || '#333',
      strokeWidth: props.strokeWidth || 1,
      width: roundToNearest(props.width, this._growthUnit, this._growthUnit),
      height: roundToNearest(props.height, this._growthUnit, this._growthUnit),
    };
  }

  public initialize(): void {
    const {
      id,
      width,
      height,
      fillColor,
      strokeColor,
      strokeWidth,
    } = this.props;

    super.initialize();

    this._shape = createSVGWithAttributes('rect', {
      id: id + '_shape',
      width,
      height,
      fill: fillColor,
      stroke: strokeColor,
      'stroke-width': strokeWidth,
    });
    this.addToGroup(this._shape);
  }

  // Width get + set.
  get width(): number {
    return this.props.width;
  }
  set width(width: number) {
    if (this._shape) {
      width = roundToNearest(width, this._growthUnit, this._growthUnit);
      this.props.width = width;
      setSVGAttribute(this._shape, 'width', width);
      this.updateTextPosition();
    } else {
      throw new PaperError(
        'E_NO_ELEM',
        `No shape exists for Node ID: ${this.props.id}`,
        'Node.base.ts',
        'set width',
      );
    }
  }

  // Height get + set.
  get height(): number {
    return this.props.height;
  }
  set height(height: number) {
    if (this._shape) {
      height = roundToNearest(height, this._growthUnit, this._growthUnit);
      this.props.width = height;
      setSVGAttribute(this._shape, 'height', height);
      this.updateTextPosition();
    } else {
      throw new PaperError(
        'E_NO_ELEM',
        `No shape exists for Node ID: ${this.props.id}`,
        'Node.base.ts',
        'set height',
      );
    }
  }
}
