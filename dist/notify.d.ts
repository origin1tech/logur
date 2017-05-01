import { INotify } from './interfaces';
/**
 * Notify
 */
export declare class Notify {
    events: {
        [key: string]: any;
    };
    /**
     * Emit
     * Emits and event.
     *
     * @param event the event to emit.
     * @param args arguments to pass.
     */
    emit(event: string, ...args: any[]): INotify;
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
    once(event: string, fn: any, ref?: string, cancel?: any, context?: any): INotify;
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
    on(event: string, fn: any, ref?: string, cancel?: any, context?: any): INotify;
    /**
     * Off
     * Removes an event listener.
     *
     * @param event the event name to remove.
     * @param fn the callback function to remove.
     * @param context the context to bind to when disable listener is called.
     *
     */
    off(event: string, fn?: any, context?: any): INotify;
    /**
     * Listeners
     * Returns listeners for an event.
     *
     * @param event the event to get listeners for.
     */
    listeners(event: string): any[];
    /**
     * Has Listeners
     * Checks if event has listeners.
     *
     * @param event the event name to check.
     */
    hasListeners(event: string): boolean;
    /**
     * Remove Listeners
     * Removes collection of listerners or all listeners.
     *
     * @param event the event to remove listeners for.
     * @param fn the callback function in the specified events.
     */
    removeListeners(event?: string): INotify;
}
