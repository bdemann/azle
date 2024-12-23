/**
 * Sets the certified data of this canister.
 *
 * Canisters can store up to 32 bytes of data that is certified by the
 * system on a regular basis. One can call {@link ic.dataCertificate} from a
 * {@link $query} call to get a certificate authenticating the value set by
 * calling this function.

 * This function can only be called from the following contexts:
 *
 * - {@link $init}, {@link $preUpgrade} and {@link $postUpgrade} hooks
 * - {@link $update} calls
 * - reply or reject callbacks
 *
 * This function traps if:
 *
 * - `data.length` > 32
 * - called from an illegal context (e.g. from a {@link $query} call)
 *
 * @param data the data to be set
 * @returns void
 */
export function setCertifiedData(data: Uint8Array): void {
    if (
        globalThis._azleIcStable === undefined &&
        globalThis._azleIcExperimental === undefined
    ) {
        return;
    }

    if (globalThis._azleIcExperimental !== undefined) {
        globalThis._azleIcExperimental.setCertifiedData(data.buffer);
        return;
    }

    globalThis._azleIcStable.setCertifiedData(data);
}
