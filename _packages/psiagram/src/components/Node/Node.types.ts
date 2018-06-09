export interface INodeProperties {
  id: string;
  title: string;
  width: number;
  height: number;
  gridSize: number;
}

export interface INodeUpdateProperties {
  id?: string;
  title?: string;
  width?: number;
  height?: number;
  gridSize?: number;
}
