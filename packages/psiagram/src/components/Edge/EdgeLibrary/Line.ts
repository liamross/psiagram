/**
 * Copyright (c) 2017-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { BaseEdge, IBaseEdgeProperties } from '../BaseEdge';
import { ICoordinates } from '../../../common';
import { createSVGWithAttributes, setSVGAttribute } from '../../../utilities';
import { PaperError } from '../../PaperError';

export interface ILineProperties extends IBaseEdgeProperties {
  paperUniqueId: string;
}

export class Line<P extends ILineProperties> extends BaseEdge<P> {
  protected _clickZone: SVGElement | null;
  protected _path: SVGElement | null;
  protected _coordinates: ICoordinates[];

  constructor(props: P) {
    super(props);
    this._clickZone = null;
    this._path = null;
    this._coordinates = [];

    this.props = {
      // To avoid ts error https://github.com/Microsoft/TypeScript/issues/14409
      ...(this.props as any),
      paperUniqueId: props.paperUniqueId,
    };
  }

  public initialize(): void {
    const { id, paperUniqueId } = this.props;

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
      'marker-end': `url(#arrow_${paperUniqueId})`,
    });

    this.addToGroup(this._clickZone);
    this.addToGroup(this._path);
  }

  public getCoordinates(): ICoordinates[] {
    return this._coordinates;
  }

  public setCoordinates(coordinates: ICoordinates[]): void {
    if (coordinates.length < 2) {
      throw new PaperError(
        'E_EDGE_LENGTH',
        `You must provide at least two coordinate points to set edge coordinates`,
        'Edge.ts',
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
        `No path exists for Edge ID: ${this.props.id}`,
        'Edge.ts',
        'coordinates',
      );
    }
  }
}
