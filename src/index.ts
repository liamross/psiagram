// Paper exports.
import { Paper } from './Paper/Paper';
import {
  IPaper,
  IPaperProps,
  IPaperInputNode,
  IPaperInputEdge,
  IActiveItem,
} from './Paper/IPaper';

// Node exports.
import { Node } from './Node/Node';
import { INodeProps } from './Node/INode';

// Edge exports.
// export { Edge } from './Edge/Edge';
import { IEdgeProps } from './Edge/IEdge';

// Other exports.
import { Coordinates } from './common/types';

// prettier-ignore
export {
  /**
   * Paper
   */
  Paper,            // Paper class.
  IPaper,           // Paper class interface.
  IPaperProps,      // Object to initialize paper.
  IPaperInputNode,  // Object to add node.
  IPaperInputEdge,  // Object to add edge.
  IActiveItem,      // Object to change active item.
  /**
   * Node
   */
  Node,             // Node class.
  INodeProps,       // Object to initialize node.
  /**
   * Edge
   */
  // Edge,             // Edge class.
  IEdgeProps,       // Object to initialize edge.
  /**
   * Other
   */
  Coordinates,      // Object to represent coordinates on paper.
};
