/**
 * Copyright (c) 2017-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Node, createSVGWithAttributes, setBatchSVGAttribute } from 'psiagram';

const FONT_HEIGHT = 14;
const WIDTH = 160;
const HEIGHT = 80;

export class StaticBlock extends Node {
  protected _growthUnit: number;
  protected _shape: SVGElement | null;
  protected _text: SVGElement | null;

  protected initialize(): void {
    const { id } = this._properties;

    this._shape = createSVGWithAttributes('rect', {
      id: id + '_shape',
      width: WIDTH,
      height: HEIGHT,
      fill: 'lightgreen',
      stroke: 'black',
      'stroke-width': 1,
    });

    this._text = createSVGWithAttributes('text', {
      id: id + '_text',
      'text-anchor': 'middle',
      'font-size': FONT_HEIGHT,
    });

    this.updateTextPosition();

    this._text.textContent = 'Static Block';
    this._group.appendChild(this._shape);
    this._group.appendChild(this._text);
  }

  protected updateTextPosition(): void {
    const fontX = WIDTH / 2;
    const fontY = FONT_HEIGHT / 2 + HEIGHT / 2;

    setBatchSVGAttribute(this._text as SVGElement, { x: fontX, y: fontY });
  }

  /** Width get + set. */
  get width(): number {
    return WIDTH;
  }

  /** Height get + set. */
  get height(): number {
    return HEIGHT;
  }
}
