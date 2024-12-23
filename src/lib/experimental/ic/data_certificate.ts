import '../experimental';

import { blob } from '../candid/types/constructed/blob';
import { None, Opt, Some } from '../candid/types/constructed/opt';

/**
 * When called from a query call, returns the data certificate
 * authenticating `certifiedData` set by this canister. Otherwise returns
 * `None`.
 * @returns the data certificate or None
 */
export function dataCertificate(): Opt<blob> {
    if (globalThis._azleIcExperimental === undefined) {
        return None;
    }

    const rawRustValue = globalThis._azleIcExperimental.dataCertificate();

    return rawRustValue === undefined
        ? None
        : Some(new Uint8Array(rawRustValue));
}
