/**
 * Copyright (c) 2017-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {IPaperInputEdge, IPaperInputNode, IPaperStoredEdge, IPaperStoredNode, Paper} from '../components/Paper';

// TODO: readonly?

export interface IPluginProperties {
	width: number;
	height: number;
	plugins: PsiagramPlugin[];
	/**
	 * Attributes are simply values: changing them will not alter the values in
	 * Paper. They are only used to pass-through any initial attributes, or the
	 * default values set-up in Paper.
	 */
	attributes: {
		gridSize: number;
		paperWrapperClass: string;
		paperClass: string;
		uniqueId: string;
	};
	initialConditions?: {
		nodes?: IPaperInputNode[];
		edges?: IPaperInputEdge[];
	};
}

export declare class PsiagramPlugin {
	/**
	 * Use the constructor to initialize the plugin before passing it into the
	 * Paper. This allows any options to be set prior to it being initialized.
	 */
	constructor();
	/**
	 * Initialize is called from within the paper. This allows the plugin to hook
	 * in and begin manipulating the paper instance. This should ONLY be used
	 * internally by the paper.
	 */
	public initialize(
		/**
		 * Instance of the paper that is initializing the plugin.
		 */
		paper: Paper,
		/**
		 * All of the properties that the paper is initialized with.
		 */
		properties: IPluginProperties,
		/**
		 * Object containing the nodes within the paper. This will be empty when the
		 * plugin is initialized, but will serve as a reference to the actual nodes
		 * object within Paper.
		 */
		nodes: {[key: string]: IPaperStoredNode},
		/**
		 * Object containing the edges within the paper. This will be empty when the
		 * plugin is initialized, but will serve as a reference to the actual edges
		 * object within Paper.
		 */
		edges: {[key: string]: IPaperStoredEdge},
	): void;
	/**
	 * This may be called if the paper is gracefully torn-down. Use this to clean
	 * up any listeners or call any end-of-lifecycle callbacks.
	 *
	 * This method is marked as optional, as your plugin may not require anything
	 * to be run during a teardown process.
	 */
	public teardown?(): void;
}
