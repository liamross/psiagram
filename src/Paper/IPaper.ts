import { INode } from '../Node/INode';
import { IEdge } from '../Edge/IEdge';
import { WorkflowType } from '../utilities/dataUtils';
import { ICoordinates, IParameters } from '../common/types';

/** Paper class interface. */
export interface IPaper {
  /**
   * Get the paper element.
   */
  getPaperElement(): HTMLElement;

  /**
   * Add a node to the paper.
   */
  addNode(node: IPaperInputNode): void;

  /**
   * Remove a node by ID from the paper.
   */
  removeNode(id: string): void;

  /**
   * Update a node with newProps by ID on the paper.
   */
  updateNode(
    id: string,
    newProps: {
      props?: IPaperNodeProps;
      coords?: ICoordinates;
    },
  ): void;

  /**
   * Add an edge to the paper.
   */
  addEdge(edge: IPaperInputEdge): void;

  /**
   * Remove an edge by ID from the paper.
   */
  removeEdge(id: string): void;

  /**
   * Update an edge with newProps by ID on the paper.
   */
  updateEdge(id: string, newProps: IPaperEdgeProps): void;

  /**
   * Updates the current active item if an active item is given, or removes any
   * active items if no parameters are given.
   */
  updateActiveItem(activeItem?: IActiveItem): void;

  /**
   * Initialize on-click listeners. This is only necessary if the component has
   * had uninit called previously, as listeners are initialized in constructor.
   *
   * @todo: Is this necessary?
   */
  init(): void;

  /**
   * Removes any listeners from the component.
   *
   * @todo: Is this necessary?
   */
  uninit(): void;
}

/** Exported types. */

export interface IPaperProps {
  width: string;
  height: string;
  plugins?: Array<{}>;
  attributes?: {
    gridSize?: number;
    allowBlockOverlap?: boolean;
    gridColor?: string;
    paperWrapperClass?: string;
    paperClass?: string;
  };
  initialConditions?: {
    nodes?: IPaperInputNode[];
    edges?: IPaperInputEdge[];
  };
}

export interface IPaperInputNode {
  id: string;
  component: any;
  props: IPaperNodeProps;
  coords: ICoordinates;
}

export interface IPaperInputEdge {
  id: string;
  component: any;
  source: { id: string };
  target: { id: string };
  props: IPaperEdgeProps;
  coords: ICoordinates[];
}

export interface IActiveItem {
  workflowType: WorkflowType;
  id: string;
  paperItemState: PaperItemState;
}

/** Local types. */

export enum PaperItemState {
  Moving = 'moving',
  Selected = 'selected',
  Default = 'default',
}

export interface IPaperStoredNode {
  id: string;
  coords: ICoordinates;
  params: IParameters;
  instance: INode;
  ref: SVGElement;
}

export interface IPaperNodeProps {
  title: string;
  width: number;
  height: number;
}

export interface IPaperStoredEdge {
  id: string;
  source: { id: string };
  target: { id: string };
  coords: ICoordinates[];
  instance: IEdge;
  ref: SVGElement;
}

export interface IPaperEdgeProps {
  coords: ICoordinates[];
}
