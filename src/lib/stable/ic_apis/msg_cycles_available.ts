/**
 * Returns the amount of cycles that were transferred by the caller of the
 * current call, and is still available in this message
 * @returns the amount of cycles
 */
export function msgCyclesAvailable(): bigint {
    if (globalThis._azleIcStable === undefined) {
        return 0n;
    }

    return BigInt(globalThis._azleIcStable.msgCyclesAvailable());
}
