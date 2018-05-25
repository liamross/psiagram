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
