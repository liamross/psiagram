/**
 * Copyright (c) 2017-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  Paper,
  PsiagramPlugin,
  IPluginProperties,
  createSVGWithAttributes,
  setSVGAttribute,
} from 'psiagram';

export interface IGridProperties {
  gridColor?: string;
}

export class Grid implements PsiagramPlugin {
  private _paperElement: SVGElement | null;
  private _gridSize: number | null;
  private _uniqueId: string | null;
  private _subgridPath: SVGElement | null;
  private _gridPath: SVGElement | null;
  private _gridColor: string;

  constructor(gridProperties?: IGridProperties) {
    this._paperElement = null;
    this._gridSize = null;
    this._uniqueId = null;
    this._gridPath = null;
    this._subgridPath = null;
    this._gridColor = (gridProperties && gridProperties.gridColor) || '#EEE';
  }

  public initialize(paper: Paper, properties: IPluginProperties): void {
    this._paperElement = paper._getDrawSurface();
    this._gridSize = properties.attributes.gridSize;
    this._uniqueId = properties.attributes.uniqueId;

    paper.addListener('paper-init', this._mountGrid);
  }

  protected _mountGrid = () => {
    const paperElement = this._paperElement as SVGElement;
    const gridSize = this._gridSize as number;
    const uniqueId = this._uniqueId as string;

    const defs = createSVGWithAttributes('defs');

    // Add grid to definitions if valid grid size is provided.
    if (gridSize > 0) {
      // Create subgrid.
      const subgrid = createSVGWithAttributes('pattern', {
        id: `subgrid_${uniqueId}`,
        width: gridSize / 2,
        height: gridSize / 2,
        patternUnits: 'userSpaceOnUse',
      });
      this._subgridPath = createSVGWithAttributes('path', {
        d: `M ${gridSize / 2} 0 L 0 0 0 ${gridSize / 2}`,
        fill: 'none',
        stroke: this._gridColor,
        'stroke-width': '0.5',
      });
      subgrid.appendChild(this._subgridPath);
      defs.appendChild(subgrid);

      // Create grid.
      const grid = createSVGWithAttributes('pattern', {
        id: `grid_${uniqueId}`,
        width: gridSize,
        height: gridSize,
        patternUnits: 'userSpaceOnUse',
      });
      const gridRect = createSVGWithAttributes('rect', {
        width: '100%',
        height: '100%',
        fill: `url(#subgrid_${uniqueId})`,
      });
      this._gridPath = createSVGWithAttributes('path', {
        d: `M ${gridSize} 0 L 0 0 0 ${gridSize}`,
        fill: 'none',
        stroke: this._gridColor,
        'stroke-width': '1',
      });
      grid.appendChild(gridRect);
      grid.appendChild(this._gridPath);
      defs.appendChild(grid);

      // Create grid container.
      const gridContainer = createSVGWithAttributes('rect', {
        width: '100%',
        height: '100%',
        fill: `url(#grid_${uniqueId})`,
      });

      // Add grid to paper.
      paperElement.insertBefore(gridContainer, paperElement.firstChild);
    }

    // Add edge arrowheads to definitions.
    // TODO: eventually implement path without marker for dynamic colors.
    const arrowhead = createSVGWithAttributes('marker', {
      id: `arrow_${uniqueId}`,
      markerWidth: '10',
      markerHeight: '10',
      refX: '6',
      refY: '5',
      orient: 'auto',
      markerUnits: 'strokeWidth',
    });
    const arrowheadPath = createSVGWithAttributes('path', {
      d: 'M 0 0 L 0 10 L 10 5 Z',
      fill: '#333',
    });
    arrowhead.appendChild(arrowheadPath);
    defs.appendChild(arrowhead);

    paperElement.insertBefore(defs, paperElement.firstChild);
  };

  get gridColor(): string {
    return this._gridColor;
  }

  set gridColor(gridColor: string) {
    if (this._gridPath) {
      setSVGAttribute(this._gridPath, 'stroke', gridColor);
    }
    if (this._subgridPath) {
      setSVGAttribute(this._subgridPath, 'stroke', gridColor);
    }
  }
}
