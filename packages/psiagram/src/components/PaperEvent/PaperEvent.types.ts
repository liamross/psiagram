/**
 * Copyright (c) 2017-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export interface IPaperEventProperties<T, D> {
  /**
   * Target of the event. In many cases this will be the item that will be
   * actioned on by the default action once all listeners have run.
   */
  target?: T;
  /**
   * If canPropagate is true, event will continue to propagate to any remaining
   * listeners. This can be prevented permanently by calling stopPropagation.
   * @default true;
   */
  canPropagate?: boolean;
  /**
   * An object to provide any additional information from the event.
   */
  data?: D;
  /**
   * The default action to invoke if all the listeners complete, or
   * defaultAction is called on the event.
   */
  defaultAction?: ((data: D) => void);
}
