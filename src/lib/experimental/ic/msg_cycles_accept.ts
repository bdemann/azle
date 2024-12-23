import '../experimental';

import { nat64 } from '../candid/types/primitive/nats/nat64';

/**
 * Moves cycles from the call to the canister balance
 * @param maxAmount the max amount of cycles to move
 * @returns the actual amount moved
 */
export function msgCyclesAccept(maxAmount: nat64): nat64 {
    if (globalThis._azleIcExperimental === undefined) {
        return 0n;
    }

    const msgCyclesAcceptAmountMovedString =
        globalThis._azleIcExperimental.msgCyclesAccept(maxAmount.toString());

    return BigInt(msgCyclesAcceptAmountMovedString);
}
