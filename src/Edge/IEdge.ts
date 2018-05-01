export interface IEdgeProps {
  coords: Array<{ x: number; y: number }>;
}

export interface IEdge {
  getEdgeElement(): SVGElement;
  updateProps(newProps: IEdgeProps): void;
  createEdgeElement(): void;
  getParameters(): { width: number; height: number };
  validateEdge(): boolean;
}
