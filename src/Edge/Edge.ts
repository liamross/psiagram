import { IEdgeProps, IEdgeUpdateProps } from './IEdge';
import { ICoordinates } from '../common/types';
import { setWorkflowType, WorkflowType } from '../utilities/dataUtils';
import {
  createSVGWithAttributes,
  setSVGAttribute,
} from '../utilities/domUtils';

export class Edge {
  private _props: IEdgeProps;
  private _element: SVGElement;
  private _path: SVGElement;

  constructor(props: IEdgeProps) {
    this._props = props;

    const { id, title } = this._props;

    const group = createSVGWithAttributes('g', {
      id,
      // Temporary:
      style: 'user-select: none',
    });

    const path = createSVGWithAttributes('path', {
      fill: 'none',
      stroke: '#333',
      'stroke-linecap': 'round',
      'stroke-width': '1px',
      'marker-end': 'url(#_arrow)',
    });

    group.appendChild(path);

    setWorkflowType(group, WorkflowType.Edge);

    this._path = path;
    this._element = group;
  }

  public getEdgeElement(): SVGElement {
    return this._element;
  }

  public updateProps(newProps: IEdgeUpdateProps): void {
    this._props = {
      ...this._props,
      ...newProps,
    };

    // TODO: Update those props in the actual ref.
  }

  public updatePath(
    source: ICoordinates,
    target: ICoordinates,
    coords?: ICoordinates[],
  ): void {
    const dString = `M ${source.x} ${source.y} ${
      coords ? coords.map(point => `L ${point.x} ${point.y} `).join() : ''
    }L ${target.x} ${target.y}`;

    setSVGAttribute(this._path, 'd', dString);
  }

  public validateEdge(): boolean {
    // TODO: implement validation (check Node.ts for help).
    return true;
  }
}
