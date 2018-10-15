/**
 * Copyright (c) 2017-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createSVGWithAttributes } from '../../utilities';

/**
 * Builds out the complete defs element for Paper component.
 *
 * @param paperElement Paper element to attach defs to.
 * @param uniqueId Unique ID of the Paper instance.
 */
export function setPaperDefs(
  paperElement: SVGElement,
  uniqueId: string,
): SVGElement {
  const defs = createSVGWithAttributes('defs');

  // Add generic black edge arrowhead.
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

  paperElement.appendChild(defs);

  return defs;
}
