/**
 * Copyright (c) 2017-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {BaseEdge, IBaseEdgeProperties} from '../BaseEdge';
import {ICoordinates} from '../../../common';
import {createSVGWithAttributes, setSVGAttribute} from '../../../utilities';
import {PaperError} from '../../PaperError';

export interface ILineProperties extends IBaseEdgeProperties {
	strokeColor?: string;
	strokeWidth?: number;
}

export class Line<P extends ILineProperties> extends BaseEdge<P> {
	protected _clickZone: SVGElement | null;
	protected _path: SVGElement | null;
	protected _coordinates: ICoordinates[];

	constructor(props: P) {
		super(props);
		this._clickZone = null;
		this._path = null;
		this._coordinates = [];

		this.props = {
			// To avoid ts error https://github.com/Microsoft/TypeScript/issues/14409
			...(this.props as any),
			strokeColor: props.strokeColor || '#333',
			strokeWidth: props.strokeWidth || 1,
		};
	}

	public initialize(): void {
		const {id, paper, strokeColor, strokeWidth} = this.props;

		// Create an SVG arrowhead for this line.
		const arrowhead = createSVGWithAttributes('marker', {
			id: this.getArrowId(),
			markerWidth: '10',
			markerHeight: '10',
			refX: '6',
			refY: '5',
			orient: 'auto',
			markerUnits: 'userSpaceOnUse',
		});
		const arrowheadPath = createSVGWithAttributes('path', {
			d: 'M 0 0 L 0 10 L 10 5 Z',
			fill: strokeColor,
		});
		arrowhead.appendChild(arrowheadPath);
		paper._insertPaperDef(arrowhead, this.getArrowId());

		this._clickZone = createSVGWithAttributes('path', {
			id: id + '_clickZone',
			fill: 'none',
			stroke: 'transparent',
			'stroke-width': `10px`,
		});

		this._path = createSVGWithAttributes('path', {
			id: id + '_path',
			fill: 'none',
			stroke: strokeColor,
			'stroke-linecap': 'round',
			'stroke-width': strokeWidth,
			'marker-end': `url(#${this.getArrowId()})`,
		});

		this.addToGroup(this._clickZone);
		this.addToGroup(this._path);
	}

	public teardown(): void {
		const {paper} = this.props;
		paper._removePaperDef(this.getArrowId());
	}

	public getCoordinates(): ICoordinates[] {
		return this._coordinates;
	}

	public setCoordinates(coordinates: ICoordinates[]): void {
		if (coordinates.length < 2) {
			throw new PaperError(
				'E_EDGE_LENGTH',
				`You must provide at least two coordinate points to set edge coordinates`,
				'Edge.ts',
				'coordinates',
			);
		}

		if (this._path && this._clickZone) {
			this._coordinates = coordinates.slice();

			const source = coordinates.shift() as ICoordinates;
			const target = coordinates.pop() as ICoordinates;

			const dString = `M ${source.x} ${source.y} ${
				coordinates.length ? coordinates.map((point) => `L ${point.x} ${point.y} `).join('') : ''
			}L ${target.x} ${target.y}`;

			setSVGAttribute(this._clickZone, 'd', dString);
			setSVGAttribute(this._path, 'd', dString);
		} else {
			throw new PaperError('E_NO_ELEM', `No path exists for Edge ID: ${this.props.id}`, 'Edge.ts', 'coordinates');
		}
	}

	protected getArrowId() {
		const {id, uniqueId} = this.props;
		return `arrow_${uniqueId}_${id}`;
	}
}
