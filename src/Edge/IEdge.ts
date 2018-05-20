import { ICoordinates } from '../common/types';

export interface IEdgeProps {
  coords: ICoordinates[];
}

export interface IEdge {
  getEdgeElement(): SVGElement;
  updateProps(newProps: IEdgeProps): void;
  createEdgeElement(): void;
  getParameters(): { width: number; height: number };
  validateEdge(): boolean;
}
