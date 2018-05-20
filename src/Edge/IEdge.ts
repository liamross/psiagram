import { Coordinates } from '../common/types';

export interface IEdgeProps {
  coords: Array<Coordinates>;
}

export interface IEdge {
  getEdgeElement(): SVGElement;
  updateProps(newProps: IEdgeProps): void;
  createEdgeElement(): void;
  getParameters(): { width: number; height: number };
  validateEdge(): boolean;
}
