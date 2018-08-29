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
  private _paperInstance: Paper | null;
  private _paperElement: SVGElement | null;
  private _gridSize: number | null;
  private _uniqueId: string | null;
  private _subgridPath: SVGElement | null;
  private _gridPath: SVGElement | null;
  private _gridColor: string;

  constructor(gridProperties?: IGridProperties) {
    this._paperInstance = null;
    this._paperElement = null;
    this._gridSize = null;
    this._uniqueId = null;
    this._gridPath = null;
    this._subgridPath = null;
    this._gridColor = (gridProperties && gridProperties.gridColor) || '#EEE';
  }

  public initialize(paper: Paper, properties: IPluginProperties): void {
    this._paperInstance = paper;
    this._paperElement = paper._getDrawSurface();
    this._gridSize = properties.attributes.gridSize;
    this._uniqueId = properties.attributes.uniqueId;

    paper.addListener('paper-init', this._mountGrid);
  }

  protected _mountGrid = () => {
    const paper = this._paperInstance as Paper;
    const paperElement = this._paperElement as SVGElement;
    const gridSize = this._gridSize as number;
    const uniqueId = this._uniqueId as string;

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
      paper._insertPaperDef(subgrid)

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
      paper._insertPaperDef(grid)

      // Create grid container.
      const gridContainer = createSVGWithAttributes('rect', {
        width: '100%',
        height: '100%',
        fill: `url(#grid_${uniqueId})`,
      });

      // Add grid to paper.
      paperElement.insertBefore(gridContainer, paperElement.firstChild);
    }
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
