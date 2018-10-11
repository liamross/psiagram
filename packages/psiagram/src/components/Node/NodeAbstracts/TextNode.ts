/**
 * Copyright (c) 2017-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Node } from '../Node';

import {
  createSVGWithAttributes,
  PaperError,
  INodeProperties,
  setBatchSVGAttribute,
} from '../../../';

export interface ITextNodeProperties extends INodeProperties {
  title: string;
  fontHeight?: number;
}

export class TextNode<P extends ITextNodeProperties> extends Node<P> {
  protected _text: SVGElement | null;

  constructor(props: P) {
    super(props);
    this._text = null;
    this.props.fontHeight = props.fontHeight || 14;
  }

  public initialize(): void {
    const { title, id, fontHeight } = this.props;

    this._text = createSVGWithAttributes('text', {
      id: id + '_text',
      'text-anchor': 'middle',
      'font-size': fontHeight,
    });
    this._text.textContent = title || '';
    this.addToGroup(this._text);
  }

  protected updateTextPosition(): void {
    const { width, height, fontHeight } = this.props;

    const fontX = width / 2;
    const fontY = (fontHeight as number) / 2 + height / 2;

    setBatchSVGAttribute(this._text as SVGElement, {
      x: fontX,
      y: fontY,
    });
  }

  /** Title get + set. */
  get title(): string {
    return this.props.title as string;
  }
  set title(title: string) {
    if (this._text) {
      this.props.title = title;
      this._text.textContent = title;
    } else {
      throw new PaperError(
        'E_NO_ELEM',
        `No text exists for Node ID: ${this.props.id}`,
        'Node.base.ts',
        'set title',
      );
    }
  }
}
