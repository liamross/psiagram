import { ICoordinates, IParameters } from '../common/types';

export interface IEdgeProps {
  coords: ICoordinates[];
}

export interface IEdge {
  getEdgeElement(): SVGElement;
  updateProps(newProps: IEdgeProps): void;
  createEdgeElement(): void;
  getParameters(): IParameters;
  validateEdge(): boolean;
}
