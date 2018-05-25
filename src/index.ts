// Paper exports.
import {
  Paper,
  IPaperProps,
  IPaperInputNode,
  IPaperInputEdge,
  IActiveItem,
} from './Paper';

// Node exports.
import { Node } from './Node';

// Edge exports.
import { Edge } from './Edge';

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
