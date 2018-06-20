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
} from 'psiagram';

export interface IGridProperties {
  gridColor?: string;
}

export class Grid implements PsiagramPlugin {
  private _gridColor: string;

  constructor({ gridColor }: IGridProperties) {
    this._gridColor = gridColor || '#EEE';
  }

  public initialize(
    paper: Paper,
    _nodes: any,
    _edges: any,
    properties: IPluginProperties,
  ): void {
    const paperElement = paper._getDrawSurface();
    const gridSize = properties.attributes.gridSize;

    const defs = createSVGWithAttributes('defs');
    paperElement.appendChild(defs);

    // Add grid to definitions if valid grid size is provided.
    if (gridSize > 0) {
      // Create subgrid.
      const subgrid = createSVGWithAttributes('pattern', {
        id: '_subgrid',
        width: gridSize / 2,
        height: gridSize / 2,
        patternUnits: 'userSpaceOnUse',
      });
      const subgridPath = createSVGWithAttributes('path', {
        d: `M ${gridSize / 2} 0 L 0 0 0 ${gridSize / 2}`,
        fill: 'none',
        stroke: this._gridColor,
        'stroke-width': '0.5',
      });
      subgrid.appendChild(subgridPath);
      defs.appendChild(subgrid);

      // Create grid.
      const grid = createSVGWithAttributes('pattern', {
        id: '_grid',
        width: gridSize,
        height: gridSize,
        patternUnits: 'userSpaceOnUse',
      });
      const gridRect = createSVGWithAttributes('rect', {
        width: '100%',
        height: '100%',
        fill: 'url(#_subgrid)',
      });
      const gridPath = createSVGWithAttributes('path', {
        d: `M ${gridSize} 0 L 0 0 0 ${gridSize}`,
        fill: 'none',
        stroke: this._gridColor,
        'stroke-width': '1',
      });
      grid.appendChild(gridRect);
      grid.appendChild(gridPath);
      defs.appendChild(grid);

      // Create grid container.
      const gridContainer = createSVGWithAttributes('rect', {
        width: '100%',
        height: '100%',
        fill: 'url(#_grid)',
      });

      // Add grid to paper.
      paperElement.appendChild(gridContainer);
    }

    // Add edge arrowheads to definitions.
    // TODO: eventually implement path without marker for dynamic colors.
    const arrowhead = createSVGWithAttributes('marker', {
      id: '_arrow',
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
  }
}
