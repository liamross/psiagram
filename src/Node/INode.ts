import { IParameters } from '../common/types';

export interface INodeProps {
  id: string;
  title: string;
  width: number;
  height: number;
  gridSize: number;
}

export interface INodeUpdateProps {
  id?: string;
  title?: string;
  width?: number;
  height?: number;
  gridSize?: number;
}

export interface INode {
  getNodeElement(): SVGElement;
  updateProps(newProps: INodeUpdateProps): void;
  getParameters(): IParameters;
  validateNode(): boolean;
}
