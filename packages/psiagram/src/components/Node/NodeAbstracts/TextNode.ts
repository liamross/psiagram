/**
 * Copyright (c) 2017-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { BaseNode, IBaseNodeProperties } from '../BaseNode';
import { createSVGWithAttributes, setBatchSVGAttribute } from '../../../utilities';
import { PaperError } from '../../PaperError';

export interface ITextNodeProperties extends IBaseNodeProperties {
  title: string;
  fontHeight?: number;
}

/**
 * TextNode **must** be extended, it does not work on its own.
 */
export class TextNode<P extends ITextNodeProperties> extends BaseNode<P> {
  protected _text: SVGElement | null;

  constructor(props: P) {
    super(props);
    this._text = null;

    this.props = {
      // To avoid ts error https://github.com/Microsoft/TypeScript/issues/14409
      ...(this.props as any),
      title: props.title,
      fontHeight: props.fontHeight || 14,
    };
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

    this.updateTextPosition();
  }

  /**
   * Updates the position of the text to keep it centered based on the width and
   * height of the Node.
   */
  protected updateTextPosition(): void {
    const { fontHeight } = this.props;
    const width = this.width;
    const height = this.height;

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
      throw new PaperError('E_NO_ELEM', `No text exists for Node ID: ${this.props.id}`, 'TextNode.ts', 'set title');
    }
  }
}
