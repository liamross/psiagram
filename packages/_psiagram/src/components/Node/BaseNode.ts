/**
 * Copyright (c) 2017-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {Paper} from '../Paper';
import {createSVGWithAttributes, setElementType, ElementType} from '../../utilities';

export interface IBaseNodeProperties {
	id: string;
	gridSize: number;
	uniqueId: string;
	paper: Paper;
}

/**
 * Node **must** be extended, it does not work on its own.
 */
export class BaseNode<P extends IBaseNodeProperties> {
	protected props: P;
	private _group: SVGElement;

	/**
	 * Node constructor. Any changes to props before they're stored in this.props
	 * should be made inside of the constructor.
	 *
	 * @param props Any properties passed to the Node.
	 */
	constructor(props: P) {
		this._group = createSVGWithAttributes('g', {
			id: props.id,
			style: 'user-select: none',
		});
		setElementType(this._group, ElementType.Node);
		this.props = props;
	}

	/**
	 * The initialize method **must** be overwritten.
	 *
	 * Initialize is called when the Node is being mounted into the DOM. You can
	 * build visual SVG components and add them to the group using
	 * this.addToGroup(element). This function is only called once, so any changes
	 * in the future must be done through setters.
	 */
	public initialize(): void {
		throw new Error('Must implement initialize method.');
	}

	/**
	 * Teardown is called when the Node is being removed from the DOM. You can
	 * cause transformations, change appearance, and teardown any listeners or
	 * processes. If none of these are needed, you do not need to overwrite this
	 * function.
	 */
	public teardown(): void {
		return;
	}

	/**
	 * Width get and set **must** be overwritten.
	 *
	 * External methods need to call ThisNode.width in order to calculate various
	 * things, and it's not as straightforward as getting it from props (ex: your
	 * component is a circle that takes only radius, so get width must return
	 * 2 * radius).
	 *
	 * You may also wish to adjust the width of this component, and in doing so,
	 * you want those changes to be reflected in the DOM automatically. All of
	 * the manipulations must be wrapped in setters so updating the DOM is as easy
	 * as This.Node.width = 200;
	 */
	get width(): number {
		throw new Error('Must implement get width.');
	}
	set width(width: number) {
		console.warn('Should implement set width.');
	}

	/**
	 * Height get and set **must** be overwritten.
	 *
	 * External methods need to call ThisNode.height in order to calculate various
	 * things, and it's not as straightforward as getting it from props (ex: your
	 * component is a circle that takes only radius, so get height must return
	 * 2 * radius).
	 *
	 * You may also wish to adjust the height of this component, and in doing so,
	 * you want those changes to be reflected in the DOM automatically. All of
	 * the manipulations must be wrapped in setters so updating the DOM is as easy
	 * as This.Node.height = 200;
	 */
	get height(): number {
		throw new Error('Must implement get height.');
	}
	set height(height: number) {
		console.warn('Should implement set height.');
	}

	/**
	 * **WARNING:** Do not modify this function unless you know what you're doing.
	 *
	 * This function will always return the Node group. Any visual components for
	 * this Node should be contained within the Node group by adding them using
	 * this.addToGroup(element).
	 */
	public getElement(): SVGElement {
		return this._group;
	}

	/**
	 * **WARNING:** Do not modify this function unless you know what you're doing.
	 *
	 * This function allows you to easily append elements into the Node group.
	 * Generally, it is used inside of initialize to add created elements to the
	 * Node group.
	 *
	 * @param element An element to add into the Node group.
	 */
	protected addToGroup(element: SVGElement): void {
		this._group.appendChild(element as SVGElement);
	}
}
