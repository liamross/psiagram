/**
 * Copyright (c) 2017-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  IEdgeProperties,
  ICoordinates,
  setElementType,
  ElementType,
  createSVGWithAttributes,
  setBatchSVGAttribute,
  setSVGAttribute,
  PaperError,
  getEdgeMidPoint,
} from '../../';

const FONT_HEIGHT = 14;

export class Edge {
  protected _properties: IEdgeProperties;

  protected _group: SVGElement;
  protected _clickZone: SVGElement | null;
  protected _path: SVGElement | null;
  protected _text: SVGElement | null;
  protected _coordinates: ICoordinates[];

  constructor(properties: IEdgeProperties) {
    this._clickZone = null;
    this._path = null;
    this._text = null;
    this._coordinates = [];

    this._properties = {
      ...properties,
      title: properties.title || '',
    };

    this._group = createSVGWithAttributes('g', {
      id: this._properties.id,
      style: 'user-select: none',
    });

    setElementType(this._group, ElementType.Edge);

    this.initialize();
  }

  public getEdgeElement(): SVGElement {
    return this._group;
  }

  protected initialize(): void {
    const { title, id } = this._properties;

    this._clickZone = createSVGWithAttributes('path', {
      id: id + '_clickZone',
      fill: 'none',
      stroke: 'transparent',
      'stroke-width': `10px`,
    });

    this._path = createSVGWithAttributes('path', {
      id: id + '_path',
      fill: 'none',
      stroke: '#333',
      'stroke-linecap': 'round',
      'stroke-width': '1px',
      'marker-end': `url(#arrow_${this._properties.paperUniqueId})`,
    });

    this._text = createSVGWithAttributes('text', {
      id: id + '_text',
      'text-anchor': 'middle',
      'font-size': FONT_HEIGHT,
    });

    this._text.textContent = title || '';

    this._group.appendChild(this._clickZone);
    this._group.appendChild(this._path);
    if (this._properties.title) this._group.appendChild(this._text);
  }

  protected updateTextPosition(): void {
    const { x, y } = getEdgeMidPoint(this._coordinates);
    setBatchSVGAttribute(this._text as SVGElement, { x, y });
  }

  // Coordinates get + set.
  get coordinates(): ICoordinates[] {
    return this._coordinates;
  }
  set coordinates(coordinates: ICoordinates[]) {
    if (coordinates.length < 2) {
      throw new PaperError(
        'E_EDGE_LENGTH',
        `You must provide at least two coordinate points to set edge coordinates`,
        'Edge.base.ts',
        'coordinates',
      );
    }

    if (this._path && this._clickZone) {
      this._coordinates = coordinates.slice();

      this.updateTextPosition();

      const source = coordinates.shift() as ICoordinates;
      const target = coordinates.pop() as ICoordinates;

      const dString = `M ${source.x} ${source.y} ${
        coordinates.length
          ? coordinates.map(point => `L ${point.x} ${point.y} `).join('')
          : ''
      }L ${target.x} ${target.y}`;

      setSVGAttribute(this._clickZone, 'd', dString);
      setSVGAttribute(this._path, 'd', dString);
    } else {
      throw new PaperError(
        'E_NO_ELEM',
        `No path exists for Edge ID: ${this._properties.id}`,
        'Edge.base.ts',
        'coordinates',
      );
    }
  }

  // Title get + set.
  get title(): string {
    return this._properties.title as string;
  }
  set title(title: string) {
    if (this._text) {
      if (!this._properties.title && title) this._group.appendChild(this._text);
      if (!title) this._group.removeChild(this._text);

      this._properties.title = title;
      this._text.textContent = title;
    } else {
      throw new PaperError(
        'E_NO_ELEM',
        `No text exists for Edge ID: ${this._properties.id}`,
        'Node.base.ts',
        'set title',
      );
    }
  }
}
