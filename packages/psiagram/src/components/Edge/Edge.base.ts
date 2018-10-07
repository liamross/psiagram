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
  setSVGAttribute,
  PaperError,
} from '../../';

// const FONT_HEIGHT = 14;

export class Edge {
  private _properties: IEdgeProperties;

  private _group: SVGElement;
  private _clickZone: SVGElement | null;
  private _path: SVGElement | null;
  private _coordinates: ICoordinates[];
  // private _text: SVGElement | null;

  constructor(properties: IEdgeProperties) {
    this._clickZone = null;
    this._path = null;
    this._coordinates = [];
    // this._text = null;

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

    // TODO: Implement title block.

    this._group.appendChild(this._clickZone);
    this._group.appendChild(this._path);
  }

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

  // TODO: Title get + set.
  // get title(): string {
  //   return this._properties.title as string;
  // }
  // set title(title: string) {
  //   if (this._text) {
  //     this._properties.title = title;
  //     this._text.textContent = title;
  //   } else {
  //     throw new PaperError(
  //       'E_NO_ELEM',
  //       `No text exists for Edge ID: ${this._properties.id}`,
  //       'Node.base.ts',
  //       'set title',
  //     );
  //   }
  // }
}
