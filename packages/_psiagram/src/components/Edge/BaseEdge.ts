/**
 * Copyright (c) 2017-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {Paper} from '../Paper';
import {createSVGWithAttributes, setElementType, ElementType} from '../../utilities';
import {ICoordinates} from '../../common';

export interface IBaseEdgeProperties {
	id: string;
	gridSize: number;
	uniqueId: string;
	paper: Paper;
}

/**
 * Edge **must** be extended, it does not work on its own.
 */
export class BaseEdge<P extends IBaseEdgeProperties> {
	protected props: P;
	private _group: SVGElement;

	/**
	 * Edge constructor. Any changes to props before they're stored in this.props
	 * should be made inside of the constructor.
	 *
	 * @param props Any properties passed to the Edge.
	 */
	constructor(props: P) {
		this._group = createSVGWithAttributes('g', {
			id: props.id,
			style: 'user-select: none',
		});
		setElementType(this._group, ElementType.Edge);
		this.props = props;
	}

	/**
	 * The initialize method **must** be overwritten.
	 *
	 * Initialize is called when the Edge is being mounted into the DOM. You can
	 * build visual SVG components and add them to the group using
	 * this.addToGroup(element). This function is only called once, so any changes
	 * in the future must be done through setters.
	 */
	public initialize(): void {
		throw new Error('Must implement initialize method.');
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
	 * The getCoordinates method **must** be overwritten.
	 *
	 * Get the actual coordinates of the Edge.
	 */
	public getCoordinates(): ICoordinates[] {
		throw new Error('Must implement getCoordinates.');
	}

	/**
	 * The setCoordinates method **must** be overwritten.
	 *
	 * Set the coordinates of the Edge.
	 *
	 * This should also update anything dependend on the position of your Edge.
	 * For example, if your Edge has a text field, then a text position updater
	 * should be called any time new coordinates are set.
	 *
	 * @param coordinates Actual coordinate points for the Edge.
	 */
	public setCoordinates(coordinates: ICoordinates[]): void {
		throw new Error('Must implement setCoordinates.');
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
