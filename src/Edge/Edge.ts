import { IEdge, IEdgeProps } from './IEdge';
import { IParameters } from '../common/types';

export class Edge implements IEdge {
  private props: IEdgeProps;
  private element: SVGElement | null;

  constructor(props) {
    this.props = props;
    this.element = null;

    this.createEdgeElement();
  }

  public getEdgeElement = (): SVGElement => {
    return null;
  };

  public updateProps = (newProps: IEdgeProps): void => {
    return null;
  };

  public createEdgeElement = (): void => {
    return null;
  };

  public getParameters = (): IParameters => {
    return null;
  };

  public validateEdge = (): boolean => {
    // TODO: implement validation (check Node.ts for help).
    return true;
  };
}
