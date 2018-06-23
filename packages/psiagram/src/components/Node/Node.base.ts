/**
 * Copyright (c) 2017-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  INodeProperties,
  createSVGWithAttributes,
  setSVGAttribute,
  setBatchSVGAttribute,
  setWorkflowType,
  WorkflowType,
  roundToNearest,
  PaperError,
} from '../../';

const FONT_HEIGHT = 14;

export class Node {
  private _properties: INodeProperties;
  private _growthUnit: number;

  private _group: SVGElement;
  private _shape: SVGElement | null;
  private _text: SVGElement | null;

  constructor(properties: INodeProperties) {
    this._growthUnit = properties.gridSize * 2;
    this._shape = null;
    this._text = null;

    this._properties = {
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

    this._group = createSVGWithAttributes('g', {
      id: this._properties.id,
      style: 'user-select: none',
    });

    setWorkflowType(this._group, WorkflowType.Node);

    this.initialize();
  }

  public getNodeElement(): SVGElement {
    return this._group;
  }

  protected initialize(): void {
    const { width, height, title, id } = this._properties;

    this._group = createSVGWithAttributes('g', {
      id,
      style: 'user-select: none',
    });

    this._shape = createSVGWithAttributes('rect', {
      id: id + '_shape',
      width,
      height,
      fill: '#EAEAEA',
      stroke: '#333',
      'stroke-width': 1,
    });

    this._text = createSVGWithAttributes('text', {
      id: id + '_text',
      'text-anchor': 'middle',
      'font-size': FONT_HEIGHT,
    });

    this.updateTextPosition();

    this._text.textContent = title || '';
    this._group.appendChild(this._shape);
    this._group.appendChild(this._text);
  }

  protected updateTextPosition(): void {
    const { width, height } = this._properties;

    const fontX = width / 2;
    const fontY = FONT_HEIGHT / 2 + height / 2;

    setBatchSVGAttribute(this._text as SVGElement, {
      x: fontX,
      y: fontY,
    });
  }

  // Title get + set.
  get title(): string {
    return this._properties.title as string;
  }
  set title(title: string) {
    if (this._text) {
      this._properties.title = title;
      this._text.textContent = title;
    } else {
      throw new PaperError(
        'E_NO_EL',
        `No text exists for Node ID: ${this._properties.id}`,
        'Node.base.ts',
        'set title',
      );
    }
  }

  // Width get + set.
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
        'E_NO_EL',
        `No shape exists for Node ID: ${this._properties.id}`,
        'Node.base.ts',
        'set width',
      );
    }
  }

  // Height get + set.
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
        'E_NO_EL',
        `No shape exists for Node ID: ${this._properties.id}`,
        'Node.base.ts',
        'set height',
      );
    }
  }
}
