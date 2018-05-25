// Paper exports.
import { Paper } from './Paper/Paper';
import {
  IPaperProps,
  IPaperInputNode,
  IPaperInputEdge,
  IActiveItem,
} from './Paper/IPaper';

// Node exports.
import { Node } from './Node/Node';

// Edge exports.
import { Edge } from './Edge/Edge';

// Other exports.
import { ICoordinates } from './common/types';

// prettier-ignore
export {
  /**
   * Paper
   */
  Paper,            // Paper class.
  IPaperProps,      // Object to initialize paper.
  IPaperInputNode,  // Object to add node.
  IPaperInputEdge,  // Object to add edge.
  IActiveItem,      // Object to change active item.
  /**
   * Node
   */
  Node,             // Node class.
  /**
   * Edge
   */
  Edge,             // Edge class.
  /**
   * Other
   */
  ICoordinates,      // Object to represent coordinates on paper.
};
