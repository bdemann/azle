import { experimentalMessage } from '../experimental';

if (globalThis._azleExperimental !== true) {
    throw new Error(experimentalMessage('azle/experimental'));
}

import { blob } from '../candid/types/constructed/blob';
import { text } from '../candid/types/primitive/text';

/**
 * Converts a candid value into a Candid string
 * @param candidEncoded a raw Candid value
 * @returns the Candid string
 */
export function candidDecode(candidEncoded: blob): text {
    if (globalThis._azleIc === undefined) {
        return '';
    }

    return globalThis._azleIc.candidDecode(candidEncoded.buffer);
}
