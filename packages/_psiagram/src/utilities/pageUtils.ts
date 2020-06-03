/**
 * Copyright (c) 2017-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Returns the x and y offset of the element relative to the viewport.
 */
export const elementOffset = (element: HTMLElement): {x: ClientRect['left']; y: ClientRect['top']} => {
	const {left, top} = element.getBoundingClientRect();
	return {x: left, y: top};
};
