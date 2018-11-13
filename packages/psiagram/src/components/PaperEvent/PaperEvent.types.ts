import {
  PaperEventType,
  IPaperStoredNode,
  IPaperStoredEdge,
  IActiveItem,
} from '../Paper/Paper.types';
import { ICoordinates } from '../../common';

// prettier-ignore
export type PaperEventProperties<T extends PaperEventType> =
  T extends PaperEventType.PaperInit ? undefined :
  { defaultAction: ((data: PaperEventData<T>) => void) }
    & (PaperEventTarget<T> extends undefined
      ? {}
      : { target: PaperEventTarget<T> })
    & (PaperEventData<T> extends undefined
      ? {}
      : { data: PaperEventData<T> });

// prettier-ignore
// export type PaperEventProperties<T> =
//   // Paper
//   T extends PaperEventType.PaperInit ? undefined :
//   // Node
//   T extends PaperEventType.AddNode ? {
//     target: PaperEventTarget<T>;
//     data: PaperEventData<T>;
//     defaultAction: ((data: PaperEventData<T>) => void) } :
//   T extends PaperEventType.MoveNode ? {
//     target: PaperEventTarget<T>;
//     data: PaperEventData<T>;
//     defaultAction: ((data: PaperEventData<T>) => void) } :
//   T extends PaperEventType.RemoveNode ? {
//     target: PaperEventTarget<T>;
//     defaultAction: (() => void) } :
//   // Edge
//   T extends PaperEventType.AddEdge ? {
//     target: PaperEventTarget<T>;
//     defaultAction: (() => void) } :
//   T extends PaperEventType.MoveEdge ? {
//     target: PaperEventTarget<T>;
//     data: PaperEventData<T>;
//     defaultAction: ((data: PaperEventData<T>) => void) } :
//   T extends PaperEventType.RemoveEdge ? {
//     target: PaperEventTarget<T>;
//     defaultAction: (() => void) } :
//   // Active Item
//   T extends PaperEventType.UpdateActiveItem ? {
//     target: PaperEventTarget<T>;
//     data: PaperEventData<T>;
//     defaultAction: ((data: PaperEventData<T>) => void) } :
//   never;

// prettier-ignore
export type PaperEventTarget<T> =
  // Paper
  T extends PaperEventType.PaperInit ? undefined :
  // Node
  T extends PaperEventType.AddNode ? IPaperStoredNode :
  T extends PaperEventType.MoveNode ? IPaperStoredNode :
  T extends PaperEventType.RemoveNode ? IPaperStoredNode :
  // Edge
  T extends PaperEventType.AddEdge ? IPaperStoredEdge :
  T extends PaperEventType.MoveEdge ? IPaperStoredEdge :
  T extends PaperEventType.RemoveEdge ? IPaperStoredEdge :
  // Active Item
  T extends PaperEventType.UpdateActiveItem ? IActiveItem | null :
  never;

// prettier-ignore
export type PaperEventData<T> =
  // Paper
  T extends PaperEventType.PaperInit ? undefined :
  // Node
  T extends PaperEventType.AddNode ? { x: number; y: number } :
  T extends PaperEventType.MoveNode ? { coords: ICoordinates; oldCoords: ICoordinates } :
  T extends PaperEventType.RemoveNode ? undefined :
  // Edge
  T extends PaperEventType.AddEdge ? undefined :
  T extends PaperEventType.MoveEdge ? {
    source: { node: IPaperStoredNode | null; midpoint: ICoordinates | null; point: ICoordinates | null };
    target: { node: IPaperStoredNode | null; midpoint: ICoordinates | null; point: ICoordinates | null };
    coords: ICoordinates[] } :
  T extends PaperEventType.RemoveEdge ? undefined :
  // Active Item
  T extends PaperEventType.UpdateActiveItem ? {
    activeItem: IActiveItem | null;
    oldActiveItem: IActiveItem | null } :
  never;
