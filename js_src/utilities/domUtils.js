/**
 * Creates and returns an element.
 * @param {string} tag - A valid tag to add a dom element of.
 * @param {Object} attributes - Key value pairs of attributes to add.
 */
export function createElementWithAttributes(tag, attributes = {}) {
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
 * @param {string} tag - A valid tag to add a namespace dom element of.
 * @param {Object} attributes - Key value pairs of attributes to add.
 */
export function createSVGWithAttributes(tag, attributes = {}) {
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
