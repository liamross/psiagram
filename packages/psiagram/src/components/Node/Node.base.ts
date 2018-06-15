/**
 * Copyright (c) 2017-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { INodeProperties, INodeUpdateProperties } from './';
import { IParameters } from '../../common/types';
import { createSVGWithAttributes } from '../../utilities/domUtils';
import { setWorkflowType, WorkflowType } from '../../utilities/dataUtils';
import { roundToNearest } from '../../utilities/workflowUtils';

export class Node {
  private _properties: INodeProperties;
  private _element: SVGElement;

  constructor(properties: INodeProperties) {
    const growthUnit = properties.gridSize * 2;

    this._properties = {
      ...properties,
      width: roundToNearest(properties.width, growthUnit, growthUnit),
      height: roundToNearest(properties.height, growthUnit, growthUnit),
    };

    const { width, height, title, id } = this._properties;
    const FONT_HEIGHT = 14;
    const fontX = width / 2;
    const fontY = FONT_HEIGHT / 2 + height / 2;

    const group = createSVGWithAttributes('g', {
      id,
      // Temporary:
      style: 'user-select: none',
    });

    // TODO: this will be dynamic based on properties.

    const shape = createSVGWithAttributes('rect', {
      width,
      height,
      fill: '#EAEAEA',
      stroke: '#333',
      'stroke-width': 1,
    });

    const text = createSVGWithAttributes('text', {
      x: fontX,
      y: fontY,
      'text-anchor': 'middle',
      'font-size': FONT_HEIGHT,
    });

    text.textContent = title;
    group.appendChild(shape);
    group.appendChild(text);

    setWorkflowType(group, WorkflowType.Node);

    this._element = group;
  }

  public getNodeElement(): SVGElement {
    return this._element;
  }

  public getParameters(): IParameters {
    // TODO: needs to return the final full size of the component.
    return {
      width: this._properties.width,
      height: this._properties.height,
    };
  }

  public updateProperties(newProperties: INodeUpdateProperties): void {
    this._properties = {
      ...this._properties,
      ...newProperties,
    };

    // TODO: Update those properties in the actual ref.
  }
}
