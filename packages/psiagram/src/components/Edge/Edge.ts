/**
 * Copyright (c) 2017-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  ICoordinates,
  setElementType,
  ElementType,
  createSVGWithAttributes,
  setSVGAttribute,
  PaperError,
} from '../../';

export interface IEdgeProperties {
  id: string;
  gridSize: number;
  paperUniqueId: string;
  [property: string]: any;
}

export class Edge<P extends IEdgeProperties> {
  protected props: P;
  protected _clickZone: SVGElement | null;
  protected _path: SVGElement | null;
  protected _coordinates: ICoordinates[];
  private _group: SVGElement;

  /**
   * Edge constructor. Any changes to props before they're stored in this.props
   * should be made inside of the constructor.
   *
   * @param props Any properties passed to the Edge.
   */
  constructor(props: P) {
    this._clickZone = null;
    this._path = null;
    this._coordinates = [];

    this._group = createSVGWithAttributes('g', {
      id: props.id,
      style: 'user-select: none',
    });
    setElementType(this._group, ElementType.Edge);
    this.props = props;
  }

  /**
   * Initialize is called when the Edge is being mounted into the DOM. You can
   * build visual SVG components and add them to the group using
   * this.addToGroup(element). This function is only called once, so any changes
   * in the future must be done through setters.
   */
  public initialize(): void {
    const { id } = this.props;

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
      'marker-end': `url(#arrow_${this.props.paperUniqueId})`,
    });

    this.addToGroup(this._clickZone);
    this.addToGroup(this._path);
  }

  /**
   * Teardown is called when the Edge is being removed from the DOM. You can
   * cause transformations, change appearance, and teardown any listeners or
   * processes. If none of these are needed, you do not need to overwrite this
   * function.
   */
  public teardown(): void {
    return;
  }

  /**
   * Get the actual coordinates of the Edge.
   */
  public getCoordinates(): ICoordinates[] {
    return this._coordinates;
  }

  /**
   * Set the coordinates of the Edge.
   *
   * This **should** be extended.
   *
   * For example, if your Edge has a text field, then a text position updater
   * should be called any time new coordinates are set.
   *
   * @param coordinates Actual coordinate points for the Edge.
   */
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

  /**
   * **WARNING:** Do not modify this function unless you know what you're doing.
   *
   * This function will always return the Edge group. Any visual components for
   * this Edge should be contained within the Edge group by adding them using
   * this.addToGroup(element).
   */
  public getElement(): SVGElement {
    return this._group;
  }

  /**
   * **WARNING:** Do not modify this function unless you know what you're doing.
   *
   * This function allows you to easily append elements into the Edge group.
   * Generally, it is used inside of initialize to add created elements to the
   * Edge group.
   *
   * @param element An element to add into the Edge group.
   */
  protected addToGroup(element: SVGElement): void {
    this._group.appendChild(element as SVGElement);
  }
}
