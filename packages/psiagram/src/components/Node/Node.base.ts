/**
 * Copyright (c) 2017-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  INodeProperties,
  createSVGWithAttributes,
  setElementType,
  ElementType,
} from '../../';

export class Node {
  protected _properties: INodeProperties;
  protected _group: SVGElement;

  /**
   * The constructor does the following things:
   *
   * 1. Assigns the return value of transformProperties to this._properties
   * 2. Creates this._group
   * 3. Calls initialize
   *
   * @param properties Any properties passed to the Node.
   */
  constructor(properties: INodeProperties) {
    this._properties = properties;
    this.transformProperties(properties);
    this._group = createSVGWithAttributes('g', {
      id: this._properties.id,
      style: 'user-select: none',
    });
    setElementType(this._group, ElementType.Node);
    this.initialize();
  }

  /**
   * This function will always return this._group. Any visual components for
   * this Node should be contained within this._group.
   */
  public getNodeElement(): SVGElement {
    return this._group;
  }

  /**
   * This function allows you to easily append elements into the Node group.
   *
   * @param element An element to add into the Node group.
   */
  private addToGroup(element: SVGElement): void {
    this._group.appendChild(element as SVGElement);
  }

  /**
   * This function is called from the constructor in order to allow you to
   * manipulate any of this._properties before initialize is called. If no
   * transformations need to be made, you do not need to extend this function.
   *
   * @param properties Any properties passed into the Node.
   */
  protected transformProperties(properties: INodeProperties): void {} // tslint:disable-line:no-empty

  /**
   * This is where you build visual SVG components and append them into
   * this._group. This function is only called once from the constructor, so any
   * changes in the future must be done through setters.
   */
  protected initialize(): void {
    return;
  }

  /**
   * This function should be called when the node is initialized, as well as
   * when the width or height are set. This is used to position the text within
   * this._group.
   */
  protected updateTextPosition(): void {
    return;
  }

  /** Width get + set. */
  get width(): number {
    throw new Error('You must overwrite get width in your Node class.');
  }
  set width(width: number) {
    console.warn('You should overwrite set width to update your Node.');
    this._properties.width = width;
  }

  /** Height get + set. */
  get height(): number {
    throw new Error('You must overwrite get height in your Node class.');
  }
  set height(height: number) {
    console.warn('You should overwrite set hight to update your Node.');
    this._properties.width = height;
  }
}
