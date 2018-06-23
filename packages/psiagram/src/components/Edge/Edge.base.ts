/**
 * Copyright (c) 2017-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  IEdgeProperties,
  ICoordinates,
  setWorkflowType,
  WorkflowType,
  createSVGWithAttributes,
  setSVGAttribute,
  PaperError,
} from '../../';

// const FONT_HEIGHT = 14;

export class Edge {
  private _properties: IEdgeProperties;

  private _group: SVGElement;
  private _path: SVGElement | null;
  // private _text: SVGElement | null;

  constructor(properties: IEdgeProperties) {
    this._path = null;
    // this._text = null;

    this._properties = {
      ...properties,
      title: properties.title || '',
    };

    this._group = createSVGWithAttributes('g', {
      id: this._properties.id,
      style: 'user-select: none',
    });

    setWorkflowType(this._group, WorkflowType.Edge);

    this.initialize();
  }

  public getEdgeElement(): SVGElement {
    return this._group;
  }

  public updatePath(
    source: ICoordinates,
    target: ICoordinates,
    coords?: ICoordinates[],
  ): void {
    if (this._path) {
      const dString = `M ${source.x} ${source.y} ${
        coords ? coords.map(point => `L ${point.x} ${point.y} `).join() : ''
      }L ${target.x} ${target.y}`;

      setSVGAttribute(this._path as SVGElement, 'd', dString);
    } else {
      throw new PaperError(
        'E_NO_EL',
        `No path exists for Edge ID: ${this._properties.id}`,
        'Edge.base.ts',
        'updatePath',
      );
    }
  }

  protected initialize(): void {
    const { title, id } = this._properties;

    this._path = createSVGWithAttributes('path', {
      id: id + '_path',
      fill: 'none',
      stroke: '#333',
      'stroke-linecap': 'round',
      'stroke-width': '1px',
      'marker-end': 'url(#_arrow)',
    });

    // TODO: Implement title block.

    this._group.appendChild(this._path);
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
  //       'E_NO_EL',
  //       `No text exists for Edge ID: ${this._properties.id}`,
  //       'Node.base.ts',
  //       'set title',
  //     );
  //   }
  // }
}
