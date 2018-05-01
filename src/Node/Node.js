import { createSVGWithAttributes } from '../utilities/domUtils';

export class Node {
  constructor(props) {
    this.props = props;
    this.element = null;

    this.createNodeElement();
  }

  validateNode() {
    // Validate that node has a title.
    if (!this.props.title) {
      return false;
    }
    // Validate that node has basic width and height params.
    if (!(this.props.width && this.props.height)) {
      return false;
    }
    // TODO: Validate that node has some style given.
  }

  getNodeElement() {
    return this.element;
  }

  createNodeElement() {
    const { width, height, title } = this.props;
    const FONT_HEIGHT = 14;
    const fontX = width / 2;
    const fontY = FONT_HEIGHT / 2 + height / 2;
    // TODO: this will be dynamic based on props.

    const group = createSVGWithAttributes('g');
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
    textContent.textContent = title;
    group.appendChild(shape);
    group.appendChild(textContent);
    this.element = group;
  }

  getParameters() {
    // TODO: needs to return the final full size of the component.
    return {
      width: this.props.width,
      height: this.props.height,
    };
  }
}
