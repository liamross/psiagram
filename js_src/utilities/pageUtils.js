/**
 * Returns the x and y offset of the element relative to the viewport.
 * @param {HTMLElement} element - Element to determine offset from.
 * @returns {{x: ClientRect.left, y: ClientRect.top}} - x and y offsets.
 */
export const elementOffset = element => {
  const { left, top } = element.getBoundingClientRect();
  return { x: left, y: top };
};
