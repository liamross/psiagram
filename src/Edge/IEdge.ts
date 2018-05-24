import { IPaperStoredNode } from '../Paper/IPaper';
import { ICoordinates, IParameters } from '../common/types';

export interface IEdgeProps {
  id: string;
  title: string;
}

export interface IEdgeUpdateProps {
  id?: string;
  title?: string;
}

export interface IEdge {
  getEdgeElement(): SVGElement;
  updateProps(newProps: IEdgeUpdateProps): void;
  updatePath(
    source: ICoordinates,
    target: ICoordinates,
    coords?: ICoordinates[],
  ): void;
  validateEdge(): boolean;
}
