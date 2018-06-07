import { Paper, paperEventType } from '../Paper';
import { IPaperEventProperties } from './';

export class PaperEvent {
  private _eventType: paperEventType;
  private _paper: Paper;
  private _target: any;
  private _defaultAction: (() => void) | null;
  private _canPropogate: boolean;

  constructor(
    eventType: paperEventType,
    { paper, target, defaultAction, canPropogate }: IPaperEventProperties,
  ) {
    this._eventType = eventType;
    this._paper = paper;
    this._target = target || null;
    this._defaultAction = defaultAction || null;
    this._canPropogate = canPropogate || true;

    console.error(this._paper);
  }

  /**
   * Get the paper event type string.
   *
   * @returns {paperEventType}
   */
  get eventType(): paperEventType {
    return this._eventType;
  }

  /**
   * Get a reference to the paper instance that created the event. This is
   * useful for calling any paper methods from the listeners.
   *
   * @returns {Paper}
   */
  get paper(): Paper {
    return this._paper;
  }

  /**
   * Get the target of the event. In many cases this will be the item that will
   * be actioned on by the default action once all listeners have run. This can
   * be done early by calling defaultAction, and can be prevented permanently by
   * calling preventDefault.
   *
   * @returns {any}
   */
  get target(): any {
    return this._target;
  }

  /**
   * If canPropogate is true, event will continue to propogate to any remaining
   * listeners. This can be prevented permanently by calling stopPropagation.
   *
   * @returns {boolean}
   */
  get canPropogate(): boolean {
    return this._canPropogate;
  }

  /**
   * Invokes the default action related to the event. This is usually called
   * after all listeners have been run, and can only be called once. Calling it
   * using this method will prevent it from being fired after listeners have
   * run. Ensure that no other listeners need to act before the default action
   * is invoked.
   */
  public defaultAction(): void {
    if (typeof this._defaultAction === 'function') {
      this._defaultAction();
    }
    this._defaultAction = null;
  }

  /**
   * Prevents the default action from being invoked by removing it from the
   * event. This is permanent, so only use if you wish to completely prevent the
   * default action.
   */
  public preventDefault(): void {
    this._defaultAction = null;
  }

  /**
   * Prevents the event from propogating any further. This will prevent any
   * other listeners from receiving the event. The default action will still be
   * fired after all listeners have completed unless it was already called or
   * preventDefault is called seperately.
   */
  public stopPropagation(): void {
    this._canPropogate = false;
  }
}
