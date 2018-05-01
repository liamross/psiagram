/**
 * Returns the x and y offset of the element relative to the viewport.
 */
export const elementOffset = (
  element: HTMLElement,
): { x: ClientRect['left']; y: ClientRect['top'] } => {
  const { left, top } = element.getBoundingClientRect();
  return { x: left, y: top };
};
