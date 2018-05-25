import { createSVGWithAttributes } from '../utilities/domUtils';
import { INodeProps, INodeUpdateProps } from './INode';
import { setWorkflowType, WorkflowType } from '../utilities/dataUtils';
import { IParameters } from '../common/types';

export class Node {
  private _props: INodeProps;
  private _element: SVGElement;

  constructor(props: INodeProps) {
    this._props = props;

    const { width, height, title, id } = this._props;
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

    const text = createSVGWithAttributes('text', {
      x: fontX,
      y: fontY,
      'text-anchor': 'middle',
      'font-size': FONT_HEIGHT,
    });

    text.textContent = title;
    group.appendChild(shape);
    group.appendChild(text);

    setWorkflowType(group, WorkflowType.Node);

    this._element = group;
  }

  public getNodeElement(): SVGElement {
    return this._element;
  }

  public updateProps(newProps: INodeUpdateProps): void {
    this._props = {
      ...this._props,
      ...newProps,
    };

    // TODO: Update those props in the actual ref.
  }

  public getParameters(): IParameters {
    // TODO: needs to return the final full size of the component.
    return {
      width: this._props.width,
      height: this._props.height,
    };
  }

  public validateNode(): boolean {
    if (!this._props.title) {
      return false;
    }

    if (!(this._props.width && this._props.height)) {
      return false;
    }
    // TODO: Validate that node has some style given.

    return true;
  }
}
