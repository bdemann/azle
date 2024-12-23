import '../experimental';

import { nat64 } from '../candid/types/primitive/nats/nat64';

/**
 * Gets the amount of funds available in the canister
 * @returns the number of cycles in the canister
 */
export function canisterBalance(): nat64 {
    if (globalThis._azleIcExperimental === undefined) {
        return 0n;
    }

    return BigInt(globalThis._azleIcExperimental.canisterBalance());
}
