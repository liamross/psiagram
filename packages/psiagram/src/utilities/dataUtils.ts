/**
 * Copyright (c) 2017-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const ELEMENT_TYPE_DATA_ATTRIBUTE = 'data-element-type';

/**
 * Set the data-element-type of an element to given ElementType.
 */
export const setElementType = (
  element: Element,
  elementType: ElementType,
): void => {
  element.setAttribute(ELEMENT_TYPE_DATA_ATTRIBUTE, elementType);
};

/**
 * Check if a target element has a workflow data attribute matching given
 * ElementType.
 */
export const hasElementType = (
  element: Element | null = null,
  elementType: ElementType,
): boolean => {
  return getElementType(element) === elementType;
};

/**
 * Returns the ElementType of an element or empty string if it has none.
 */
export const getElementType = (
  element: Element | null = null,
): ElementType | string => {
  return element
    ? (element.getAttribute(ELEMENT_TYPE_DATA_ATTRIBUTE) as ElementType)
    : '';
};

/**
 * Possible values for workflow data attribute.
 */
export enum ElementType {
  Paper = 'paper',
  Node = 'node',
  Edge = 'edge',
}
