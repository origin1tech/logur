import { INotify } from './interfaces';
import * as u from './utils';

/**
 * Notify
 */
export class Notify {

  // Events collection.
  events: { [key: string]: any } = {};

  /**
   * Emit
   * Emits and event.
   *
   * @param event the event to emit.
   * @param args arguments to pass.
   */
  emit(event: string, ...args: any[]): INotify {

    // let _args = [].concat.apply([], args);
    let events = this.events[event];

    if (events) {
      events = events.slice(0);
      for (let i = 0, len = events.length; i < len; ++i) {
        events[i].apply(this, args);
      }
    }

    return this;
  }

  /**
   * Once
   * Adds an event listener once.
   *
   * @param event the event type to listen on.
   * @param fn the event to call on listen.
   * @param ref the database reference.
   * @param cancel the listener to call when listener is disabled.
   * @param context the context to bind on listener called.
   */
  once(event: string, fn: any, ref?: string, cancel?: any, context?: any): INotify {

    if (typeof cancel !== 'function') {
      context = cancel;
      cancel = undefined;
    }

    let self = this;

    // Save ref context and cancel callback.
    fn.ref = ref;
    fn.cancel = cancel;
    fn.context = context;

    function _on(): void {
      self.off(event, _on);
      fn.apply(self, arguments);
    }

    _on['fn'] = fn;
    this.on(event, _on);

    return this;

  }

  /**
   * On
   * Adds an event listener.
   *
   * @param event the event type to listen on.
   * @param fn the event to call on listen.
   * @param ref the database reference.
   * @param cancel the listener to call when listener is disabled.
   * @param context the context to bind on listener called.
   */
  on(event: string, fn: any, ref?: string, cancel?: any, context?: any): INotify {

    if (typeof cancel !== 'function') {
      context = cancel;
      cancel = undefined;
    }

    // Save ref context and cancel callack.
    fn.ref = ref;
    fn.cancel = cancel;
    fn.context = context;

    (this.events[event] = this.events[event] || [])
      .push(fn);
    return this;

  }

  /**
   * Off
   * Removes an event listener.
   *
   * @param event the event name to remove.
   * @param fn the callback function to remove.
   * @param context the context to bind to when disable listener is called.
   *
   */
  off(event: string, fn?: any, context?: any): INotify {

    let events = this.events[event];

    // If no events return.
    if (!events)
      return this;

    // Save context
    fn.context = context;

    // remove specific callback.
    for (let i = 0; i < events.length; i++) {
      const cb = events[i];
      const cancel = cb.cancel || (cb.fn && cb.fn.cancel) || u.noop;
      const ctx = cb.context || (cb.fn && cb.fn.context) || this;
      if (cb === fn || cb.fn === fn) {
        cancel.call(ctx);
        events.splice(i, 1);
        break;
      }
    }

    return this;
  }

  /**
   * Listeners
   * Returns listeners for an event.
   *
   * @param event the event to get listeners for.
   */
  listeners(event: string): any[] {
    return this.events[event] || [];
  }

  /**
   * Has Listeners
   * Checks if event has listeners.
   *
   * @param event the event name to check.
   */
  hasListeners(event: string): boolean {
    return !!this.events[event].length;
  }

  /**
   * Remove Listeners
   * Removes collection of listerners or all listeners.
   *
   * @param event the event to remove listeners for.
   * @param fn the callback function in the specified events.
   */
  removeListeners(event?: string): INotify {

    if (!event)
      this.events = {};
    else if (this.events[event])
      delete this.events[event];

    return this;

  }

}

