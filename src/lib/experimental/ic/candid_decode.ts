import '../experimental';

import { blob } from '../candid/types/constructed/blob';
import { text } from '../candid/types/primitive/text';

/**
 * Converts a candid value into a Candid string
 * @param candidEncoded a raw Candid value
 * @returns the Candid string
 */
export function candidDecode(candidEncoded: blob): text {
    if (globalThis._azleIcExperimental === undefined) {
        return '';
    }

    return globalThis._azleIcExperimental.candidDecode(candidEncoded.buffer);
}
