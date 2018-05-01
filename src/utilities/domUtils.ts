/**
 * Creates and returns an element.
 */
export function createElementWithAttributes(
  tag: string,
  attributes: { [key: string]: any } = {},
): HTMLElement | null {
  if (typeof tag === 'string' && typeof attributes === 'object') {
    const el = document.createElement(tag);
    for (let key in attributes) {
      el.setAttribute(key, attributes[key]);
    }
    return el;
  }
  return null;
}

/**
 * Creates and returns a namespace element.
 */
export function createSVGWithAttributes(
  tag: string,
  attributes: { [key: string]: any } = {},
): SVGElement | null {
  if (typeof tag === 'string' && typeof attributes === 'object') {
    const xmlns = 'http://www.w3.org/2000/svg';
    const ns = document.createElementNS(xmlns, tag);
    for (let key in attributes) {
      ns.setAttributeNS(null, key, attributes[key]);
    }
    return ns;
  }
  return null;
}
