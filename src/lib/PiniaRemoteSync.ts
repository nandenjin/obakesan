import { PiniaPlugin, Store, StoreState } from "pinia";

/**
 * A class that syncs Pinia stores to another client.
 * @see {@link createPiniaRemoteSync}
 */
export class PiniaRemoteSync {
  private stores: Map<string, Store> = new Map();
  private subscribers: Set<(store: Store) => void> = new Set();

  /**
   * @see {@link createPiniaRemoteSync}
   * @param filter A function to filter stores to be relayed
   */
  constructor(private filter?: (storeName: string) => boolean) {}

  /**
   * @param subscriber A function to be called to emit store changes to the remote
   * @returns Unsubscribe function
   */
  subscribe(subscriber: (store: Store) => void): () => void {
    this.subscribers.add(subscriber);

    for (const key in this.stores) {
      subscriber(this.stores.get(key)!);
    }

    return () => {
      this.unsubscribe(subscriber);
    };
  }

  /**
   * Unsubscribe from store changes
   * @param subscriber The function to unsubscribe
   */
  unsubscribe(subscriber: (store: Store) => void): boolean {
    return this.subscribers.delete(subscriber);
  }

  /**
   * Receive store changes from the another client
   * @param storeId Store ID
   * @param statePatch
   */
  emitByRemote<S extends Store>(
    storeId: S["$id"],
    statePatch: Partial<StoreState<S>>
  ) {
    const store = this.stores.get(storeId);
    if (!store) {
      return;
    }
    store._byEmit = true;
    store.$patch(statePatch);
  }

  /**
   * @returns A Pinia plugin to be used in `pinia.use()`
   */
  getPlugin(): PiniaPlugin {
    return ({ store }) => {
      this.stores.set(store.$id, store);

      if (this.filter && !this.filter(store.$id)) {
        return {};
      }

      const $emit = (state: Partial<typeof store.$state>) => {
        store._byEmit = true;
        store.$patch(state);
      };

      store.$subscribe(() => {
        if (store._byEmit) {
          store._byEmit = false;
          return;
        }
        this.subscribers.forEach((subscriber) => subscriber(store));
      });

      return {
        _byEmit: false,
        $emit,
      };
    };
  }
}

/**
 * Create a PiniaRemoteSync instance
 * @param filter A function to filter stores to be synced
 * @example
 * ```ts
 * // Create a PiniaRemoteSync instance
 * const piniaRemoteSync = createPiniaRemoteSync();
 *
 * // Send to remote
 * piniaRemoteSync.subscribe((store) => {
 *   connectionToRemote.send("change", store.$id, store.$state);
 * });
 *
 * // Receive from remote
 * connectionToRemote.on("change", (storeId, statePatch) => {
 *   piniaRemoteSync.emitByRemote(storeId, statePatch);
 * });
 *
 * // Install to Pinia
 * pinia.use(piniaRemoteSync.getPlugin());
 * ```
 */
export function createPiniaRemoteSync(filter?: (storeName: string) => boolean) {
  return new PiniaRemoteSync(filter);
}

declare module "pinia" {
  export interface PiniaCustomProperties {
    _byEmit: boolean;
    $emit: (state: Partial<Store["$state"]>) => void;
  }
}
