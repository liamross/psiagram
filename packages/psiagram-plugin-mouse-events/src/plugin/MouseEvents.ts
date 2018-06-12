import {
  getWorkflowType,
  WorkflowType,
  Paper,
  PaperItemState,
  roundToNearest,
  PsiagramPlugin,
} from 'psiagram';

export class MouseEvents implements PsiagramPlugin {
  private _paperInstance: Paper;

  constructor(paper: Paper) {
    this._paperInstance = paper;
  }

  public initialize(): void {
    this._paperInstance._paperWrapper.addEventListener(
      'mousedown',
      this._handleMouseDown,
    );
  }

  public teardown(): void {
    this._paperInstance._paperWrapper.removeEventListener(
      'mousedown',
      this._handleMouseDown,
    );
  }

  private _handleMouseDown = (evt: MouseEvent): void => {
    const containerElement = (evt.target as Element).parentElement;
    const workflowType = getWorkflowType(containerElement);
    if (containerElement) {
      switch (workflowType) {
        case WorkflowType.Node:
          this._handleNodeMouseDown(evt, containerElement.id);
          break;
        case WorkflowType.Edge:
          this._handleEdgeMouseDown(evt, containerElement.id);
          break;
        case WorkflowType.Paper:
          // Do we need to give ID?
          this._handlePaperMouseDown(evt, containerElement.id);
          break;
        default:
          break;
      }
    }
  };
  private _handleNodeMouseDown(evt: MouseEvent, id: string): void {
    if (this._paperInstance._nodes.hasOwnProperty(id)) {
      const node = this._paperInstance._nodes[id];
      // Set clicked node as moving item.
      this._paperInstance.updateActiveItem({
        id,
        paperItemState: PaperItemState.Moving,
        workflowType: WorkflowType.Node,
      });
      // Store initial mouse coordinates.
      this._paperInstance._initialMouseCoords = {
        x: evt.clientX,
        y: evt.clientY,
      };
      // Store original coordinates in paper (to nearest grid).
      this._paperInstance._initialPaperCoords = {
        x: roundToNearest(node.coords.x, this._paperInstance._gridSize),
        y: roundToNearest(node.coords.y, this._paperInstance._gridSize),
      };
      // Move node to top within paper.
      this._paperInstance._paper.appendChild(node.ref);
      // Initialize mouse movement and release listeners.
      document.addEventListener('mousemove', this._handleNodeMouseMove);
      document.addEventListener('mouseup', this._handleNodeMouseUp);
    } else {
      console.error(
        `Handle node mousedown: node with id ${id} does not exist.`,
      );
    }
  }
  private _handleNodeMouseMove = (evt: MouseEvent): void => {
    if (
      this._paperInstance._activeItem &&
      this._paperInstance._activeItem.workflowType === WorkflowType.Node &&
      this._paperInstance._activeItem.paperItemState ===
        PaperItemState.Moving &&
      this._paperInstance._initialMouseCoords &&
      this._paperInstance._initialPaperCoords
    ) {
      const id = this._paperInstance._activeItem.id;
      // Find mouse deltas vs original coordinates.
      const mouseDeltaX =
        this._paperInstance._initialMouseCoords.x - evt.clientX;
      const mouseDeltaY =
        this._paperInstance._initialMouseCoords.y - evt.clientY;
      // Round mouse deltas to nearest grid.
      const roundedMouseDeltaX = roundToNearest(
        mouseDeltaX,
        this._paperInstance._gridSize,
      );
      const roundedMouseDeltaY = roundToNearest(
        mouseDeltaY,
        this._paperInstance._gridSize,
      );
      // Find new block coordinates.
      const blockX =
        this._paperInstance._initialPaperCoords.x - roundedMouseDeltaX;
      const blockY =
        this._paperInstance._initialPaperCoords.y - roundedMouseDeltaY;
      // TODO: Check if dragged block is overlapping.
      this._paperInstance.moveNode(id, { x: blockX, y: blockY });
    } else {
      console.error(
        `Handle node mousemove: no current moving node. Active item: `,
        this._paperInstance._activeItem,
      );
    }
  };
  private _handleNodeMouseUp = (): void => {
    if (
      this._paperInstance._activeItem &&
      this._paperInstance._activeItem.workflowType === WorkflowType.Node &&
      this._paperInstance._activeItem.paperItemState === PaperItemState.Moving
    ) {
      // Set active node to selected state.
      this._paperInstance.updateActiveItem({
        ...this._paperInstance._activeItem,
        paperItemState: PaperItemState.Selected,
      });
    } else {
      console.error(
        `Handle node mouseup: no current moving node. Active item: `,
        this._paperInstance._activeItem,
      );
    }
    // Remove listeners and reset coordinates.
    this._resetMouseListeners();
  };
  private _handleEdgeMouseDown(evt: MouseEvent, id: string): void {
    // TODO: implement.
  }
  private _handleEdgeMouseMove = (evt: MouseEvent): void => {
    // TODO: implement.
  };
  private _handleEdgeMouseUp = (): void => {
    // TODO: implement.
  };
  private _handlePaperMouseDown(evt: MouseEvent, id: string): void {
    // TODO: implement.
    // Deselect any selected items.
    this._paperInstance.updateActiveItem();
  }
  private _resetMouseListeners(): void {
    // Remove listeners.
    document.removeEventListener('mousemove', this._handleNodeMouseMove);
    document.removeEventListener('mouseup', this._handleNodeMouseUp);
    document.removeEventListener('mousemove', this._handleEdgeMouseMove);
    document.removeEventListener('mouseup', this._handleEdgeMouseUp);
    // Reset coordinates.
    this._paperInstance._initialMouseCoords = null;
    this._paperInstance._initialPaperCoords = null;
  }
}
