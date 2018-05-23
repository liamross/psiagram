import { IPaperStoredNode } from '../Paper/IPaper';
import { ICoordinates, IParameters } from '../common/types';

export interface IEdgeProps {
  id?: string;
  title?: string;
}

export interface IEdge {
  getEdgeElement(): SVGElement;
  updateProps(newProps: IEdgeProps): void;
  createEdgeElement(): void;
  getParameters(): IParameters;
  validateEdge(): boolean;
}
