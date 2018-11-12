/**
 * Copyright (c) 2017-present, Liam Ross
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { paperEventType } from '../Paper/Paper.types';
import { Paper } from '../Paper/Paper.base';
import { IPaperEventProperties } from './PaperEvent.types';

export class PaperEvent<T = undefined, D = undefined> {
  private _eventType: paperEventType;
  private _paper: Paper;

  private _target: T | undefined;
  private _canPropagate: boolean;
  private _data: D | undefined;
  private _defaultAction: ((data: D) => void) | undefined;

  constructor(
    eventType: paperEventType,
    paper: Paper,
    paperEventProperties: IPaperEventProperties<T, D> = {},
  ) {
    const { target, canPropagate, data, defaultAction } = paperEventProperties;

    this._eventType = eventType;
    this._paper = paper;

    this._target = target;
    this._canPropagate = canPropagate === undefined ? true : !!canPropagate;
    this._data = data;
    this._defaultAction = defaultAction;
  }

  /**
   * Get the paper event type string.
   */
  get eventType(): paperEventType {
    return this._eventType;
  }

  /**
   * Get a reference to the paper instance that created the event. This is
   * useful for calling any paper methods from the listeners.
   */
  get paper(): Paper {
    return this._paper;
  }

  /**
   * Get the target of the event. In many cases this will be the item that will
   * be actioned on by the default action once all listeners have run. This can
   * be done early by calling defaultAction, and can be prevented permanently by
   * calling preventDefault.
   */
  get target(): T {
    return this._target as T;
  }

  /**
   * Get boolean canPropagate. If canPropagate is true, event will continue to
   * propagate to any remaining listeners. Propagation can be stopped by calling
   * stopPropagation.
   */
  get canPropagate(): boolean {
    return this._canPropagate;
  }

  /**
   * Get the data object. This contains any other data specific to the event.
   */
  get data(): D {
    return this._data as D;
  }

  /**
   * Invokes the default action related to the event. This is usually called
   * after all listeners have been run, and can only be called once. Calling it
   * using this method will prevent it from being fired after listeners have
   * run. Ensure that no other listeners need to act before the default action
   * is invoked.
   */
  public defaultAction(): void {
    const data = this._data as D;
    if (this._defaultAction) this._defaultAction(data);
    this._defaultAction = undefined;
  }

  /**
   * Prevents the default action from being invoked by removing it from the
   * event. This is permanent, so only use if you wish to completely prevent the
   * default action.
   */
  public preventDefault(): void {
    this._defaultAction = undefined;
  }

  /**
   * Prevents the event from propagating any further. This will prevent any
   * other listeners from receiving the event. The default action will still be
   * fired after all listeners have completed unless it was already called or
   * preventDefault is called separately.
   */
  public stopPropagation(): void {
    this._canPropagate = false;
  }
}
