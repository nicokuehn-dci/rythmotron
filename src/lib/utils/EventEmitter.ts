/**
 * EventEmitter.ts
 * Simple typed event emitter for use in services
 */

export type EventListener<T = any> = (data: T) => void;

export class EventEmitter<Events extends Record<string, any>> {
  private eventListeners: {
    [K in keyof Events]?: Array<EventListener<Events[K]>>;
  } = {};

  /**
   * Register an event listener
   */
  on<K extends keyof Events>(event: K, listener: EventListener<Events[K]>): void {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event]!.push(listener);
  }

  /**
   * Remove an event listener
   */
  off<K extends keyof Events>(event: K, listener: EventListener<Events[K]>): void {
    if (!this.eventListeners[event]) return;
    
    const index = this.eventListeners[event]!.indexOf(listener);
    if (index !== -1) {
      this.eventListeners[event]!.splice(index, 1);
    }
  }

  /**
   * Emit an event with data
   */
  emit<K extends keyof Events>(event: K, data: Events[K]): void {
    if (!this.eventListeners[event]) return;
    
    this.eventListeners[event]!.forEach(listener => {
      try {
        listener(data);
      } catch (err) {
        console.error(`Error in event listener for ${String(event)}:`, err);
      }
    });
  }

  /**
   * Remove all event listeners
   */
  clearListeners<K extends keyof Events>(event?: K): void {
    if (event) {
      this.eventListeners[event] = [];
    } else {
      this.eventListeners = {};
    }
  }
}