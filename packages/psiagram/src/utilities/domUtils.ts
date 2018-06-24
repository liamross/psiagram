/**
 * Copyright (c) 2017-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Creates and returns an element.
 */
export const createElementWithAttributes = (
  tag: string,
  attributes: { [key: string]: any } = {},
): HTMLElement => {
  const el = document.createElement(tag);
  for (const key in attributes) {
    if (attributes.hasOwnProperty(key) && !(attributes[key] == null)) {
      el.setAttribute(key, attributes[key]);
    }
  }
  return el;
};

/**
 * Creates and returns a namespace element.
 */
export const createSVGWithAttributes = (
  tag: string,
  attributes: { [key: string]: any } = {},
): SVGElement => {
  const xmlns = 'http://www.w3.org/2000/svg';
  const ns = document.createElementNS(xmlns, tag);
  for (const key in attributes) {
    if (attributes.hasOwnProperty(key) && !(attributes[key] == null)) {
      ns.setAttributeNS('', key, attributes[key]);
    }
  }
  return ns;
};

export const setElementAttribute = (
  element: HTMLElement,
  attribute: string,
  value: any,
): void => {
  element.setAttribute(attribute, value);
};

export const setSVGAttribute = (
  svgElement: SVGElement,
  attribute: string,
  value: any,
): void => {
  svgElement.setAttributeNS('', attribute, value);
};

export const setBatchElementAttributes = (
  element: HTMLElement,
  attributes: { [key: string]: any },
) => {
  for (const attribute in attributes) {
    if (attributes.hasOwnProperty(attribute)) {
      setElementAttribute(element, attribute, attributes[attribute]);
    }
  }
};

export const setBatchSVGAttribute = (
  svgElement: SVGElement,
  attributes: { [key: string]: any },
) => {
  for (const attribute in attributes) {
    if (attributes.hasOwnProperty(attribute)) {
      setSVGAttribute(svgElement, attribute, attributes[attribute]);
    }
  }
};
