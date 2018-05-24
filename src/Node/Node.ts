import { createSVGWithAttributes } from '../utilities/domUtils';
import { INodeProps, INode, INodeUpdateProps } from './INode';
import { setWorkflowType, WorkflowType } from '../utilities/dataUtils';

export class Node implements INode {
  private props: INodeProps;
  private element: SVGElement;

  constructor(props: INodeProps) {
    this.props = props;

    const { width, height, title, id } = this.props;
    const FONT_HEIGHT = 14;
    const fontX = width / 2;
    const fontY = FONT_HEIGHT / 2 + height / 2;

    const group = createSVGWithAttributes('g', {
      id,
      // Temporary:
      style: 'user-select: none',
    });

    // TODO: this will be dynamic based on props.

    const shape = createSVGWithAttributes('rect', {
      width,
      height,
      fill: '#EAEAEA',
      stroke: '#333',
      'stroke-width': 1,
    });

    const textContent = createSVGWithAttributes('text', {
      x: fontX,
      y: fontY,
      'text-anchor': 'middle',
      'font-size': FONT_HEIGHT,
    });

    // Append shape and title into group.
    textContent.textContent = title;
    group.appendChild(shape);
    group.appendChild(textContent);

    // Set workflow type attribute to node.
    setWorkflowType(group, WorkflowType.Node);

    this.element = group;
  }

  public getNodeElement() {
    return this.element;
  }

  public updateProps(newProps: INodeUpdateProps): void {
    this.props = {
      ...this.props,
      ...newProps,
    };

    // TODO: Update those props in the actual ref.
  }

  public getParameters() {
    // TODO: needs to return the final full size of the component.
    return {
      width: this.props.width,
      height: this.props.height,
    };
  }

  public validateNode() {
    // Validate that node has a title.
    if (!this.props.title) {
      return false;
    }
    // Validate that node has basic width and height params.
    if (!(this.props.width && this.props.height)) {
      return false;
    }
    // TODO: Validate that node has some style given.

    return true;
  }
}
