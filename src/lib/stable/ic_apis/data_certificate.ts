/**
 * When called from a query call, returns the data certificate
 * authenticating `certifiedData` set by this canister. Otherwise returns
 * `None`.
 * @returns the data certificate or None
 */
export function dataCertificate(): Uint8Array | undefined {
    if (globalThis._azleIcStable === undefined) {
        return undefined;
    }

    return globalThis._azleIcStable.dataCertificate();
}
