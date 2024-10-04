/**
 * Cancels an existing timer. Does nothing if the timer has already been canceled.
 * @param id The ID of the timer to be cancelled.
 */
export function clearTimer(timerId: bigint): void {
    if (globalThis._azleIcStable === undefined) {
        return undefined;
    }

    globalThis._azleIcStable.clearTimer(timerId);

    const timerCallbackId = globalThis._azleIcTimers[timerId.toString()];

    delete globalThis._azleIcTimers[timerId.toString()];
    delete globalThis._azleTimerCallbacks[timerCallbackId];
}
