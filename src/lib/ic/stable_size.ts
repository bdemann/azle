import { decode } from '../candid/serde/decode';
import { nat32 } from '../candid/types/primitive/nats/nat32';

/**
 * Gets current size of the stable memory (in WASM pages)
 * @returns the current memory size
 */
export function stableSize(): nat32 {
    if (globalThis._azleIc === undefined) {
        return undefined as any;
    }

    return Number(globalThis._azleIc.stableSize());
}
