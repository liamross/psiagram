export interface INodeProps {
  title: string;
  width: number;
  height: number;
}

export interface INode {
  getNodeElement(): SVGElement;
  updateProps(newProps: INodeProps): void;
  createNodeElement(): void;
  getParameters(): { width: number; height: number };
  validateNode(): boolean;
}
