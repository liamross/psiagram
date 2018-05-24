import { IEdge, IEdgeProps } from './IEdge';
import { IParameters, ICoordinates } from '../common/types';
import {
  createSVGWithAttributes,
  setSVGAttribute,
} from '../utilities/domUtils';
import { setWorkflowType, WorkflowType } from '../utilities/dataUtils';

export class Edge implements IEdge {
  private props: IEdgeProps;
  private element: SVGElement | null;
  private path: SVGElement | null;

  constructor(props) {
    this.props = props;
    this.element = null;
    this.path = null;

    this.createEdgeElement();
  }

  public getEdgeElement = (): SVGElement => {
    return this.element;
  };

  public updateProps = (newProps: IEdgeProps): void => {
    this.props = {
      ...this.props,
      ...newProps,
    };

    // TODO: Update those props in the actual ref.
  };

  public updatePath = (
    source: ICoordinates,
    target: ICoordinates,
    coords?: ICoordinates[],
  ): void => {
    // Generate string for d attribute of SVG path.
    const dString = `M ${source.x} ${source.y} ${coords
      .map(point => `L ${point.x} ${point.y} `)
      .join()}L ${target.x} ${target.y}`;

    // Set edge refs path.
    setSVGAttribute(this.path, 'd', dString);
  };

  public createEdgeElement = (): void => {
    const { id, title } = this.props;

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

    // Set workflow type attribute to edge.
    setWorkflowType(group, WorkflowType.Edge);

    this.path = path;
    this.element = group;
  };

  public validateEdge = (): boolean => {
    // TODO: implement validation (check Node.ts for help).
    return true;
  };
}
