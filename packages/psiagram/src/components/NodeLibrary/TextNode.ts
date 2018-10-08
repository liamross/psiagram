/**
 * Copyright (c) 2017-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  Node,
  createSVGWithAttributes,
  setSVGAttribute,
  setBatchSVGAttribute,
  roundToNearest,
  PaperError,
  INodeProperties,
} from '../../';

export interface ITextNodeProperties extends INodeProperties {
  title: string;
}

const FONT_HEIGHT = 14;

export class TextNode extends Node {
  protected _growthUnit: number;
  protected _shape: SVGElement | null;
  protected _text: SVGElement | null;

  constructor(properties: ITextNodeProperties) {
    super(properties);

    this._group.appendChild(this._text as SVGElement);
  }

  protected transformProperties(properties: ITextNodeProperties): void {
    this._properties.title = properties.title || '';
  }

  protected initialize(): void {
    const { title, id } = this._properties;

    this._text = createSVGWithAttributes('text', {
      id: id + '_text',
      'text-anchor': 'middle',
      'font-size': FONT_HEIGHT,
    });

    this.updateTextPosition();

    this._text.textContent = title || '';
  }

  /**
   * This function should be called when the node is initialized, as well as
   * when the width or height are set. This is used to position the text within
   * this._group.
   */
  protected updateTextPosition(): void {
    const { width, height } = this._properties;

    const fontX = width / 2;
    const fontY = FONT_HEIGHT / 2 + height / 2;

    setBatchSVGAttribute(this._text as SVGElement, { x: fontX, y: fontY });
  }

  /** Title get + set. */
  get title(): string {
    return this._properties.title as string;
  }
  set title(title: string) {
    if (this._text) {
      this._properties.title = title;
      this._text.textContent = title;
    } else {
      throw new PaperError(
        'E_NO_ELEM',
        `No text exists for Node ID: ${this._properties.id}`,
        'Node.base.ts',
        'set title',
      );
    }
  }

  /** Width get + set. */
  get width(): number {
    return this._properties.width;
  }
  set width(width: number) {
    if (this._shape) {
      width = roundToNearest(width, this._growthUnit, this._growthUnit);
      this._properties.width = width;
      setSVGAttribute(this._shape, 'width', width);
      this.updateTextPosition();
    } else {
      throw new PaperError(
        'E_NO_ELEM',
        `No shape exists for Node ID: ${this._properties.id}`,
        'Node.base.ts',
        'set width',
      );
    }
  }

  /** Height get + set. */
  get height(): number {
    return this._properties.height;
  }
  set height(height: number) {
    if (this._shape) {
      height = roundToNearest(height, this._growthUnit, this._growthUnit);
      this._properties.width = height;
      setSVGAttribute(this._shape, 'height', height);
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
