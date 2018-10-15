/**
 * Copyright (c) 2017-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Line, ILineProperties } from './Line';
import {
  createSVGWithAttributes,
  getEdgeMidPoint,
  setBatchSVGAttribute,
} from '../../../utilities';
import { ICoordinates } from '../../../common';

export interface ITextLineProperties extends ILineProperties {
  title: string;
  fontHeight?: number;
}

export class TextLine<P extends ITextLineProperties> extends Line<P> {
  protected _text: SVGElement | null;

  constructor(props: P) {
    super(props);
    this._text = null;
    this.props.fontHeight = props.fontHeight || 14;
  }

  public initialize(): void {
    const { title, id, fontHeight } = this.props;

    super.initialize();

    this._text = createSVGWithAttributes('text', {
      id: id + '_text',
      'text-anchor': 'middle',
      'font-size': fontHeight,
    });
    this._text.textContent = title || '';
    this.addToGroup(this._text);
  }

  public setCoordinates(coordinates: ICoordinates[]): void {
    super.setCoordinates(coordinates);
    this.updateTextPosition();
  }

  protected updateTextPosition(): void {
    const { x, y } = getEdgeMidPoint(this._coordinates);
    setBatchSVGAttribute(this._text as SVGElement, { x, y });
  }
}
