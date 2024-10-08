/**
 * Moves cycles from the call to the canister balance
 * @param maxAmount the max amount of cycles to move
 * @returns the actual amount moved
 */
export function msgCyclesAccept(maxAmount: bigint): bigint {
    if (globalThis._azleIcStable === undefined) {
        return 0n;
    }

    return BigInt(
        globalThis._azleIcStable.msgCyclesAccept(maxAmount.toString())
    );
}
