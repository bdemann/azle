// TODO document that the following will not work: cache, keepalive

// TODO should we ensure that this works in Node.js as well? Or just focus on the browser?

import { createActor } from './actor';
import { call } from './call';
import { getCanisterId } from './get_canister_id';
import { getHostFromBrowser } from './host';
import { getIdentity } from './identity';
import { createResponse } from './response';

const originalFetch = window.fetch;

// TODO it would be nice to get rid of the any cast
// TODO and to ensure that we really are using the correct types for fetch
(window as any).fetch = fetchIc;

// TODO implement credentials
// TODO implement integrity
// TODO implement mode
// TODO implement redirect
// TODO implement referrer
// TODO implement referrerPolicy
// TODO implement signal
export async function fetchIc(
    input: RequestInfo | URL,
    init?: RequestInit | undefined
): Promise<Response> {
    const identity = getIdentity(init?.headers);

    if (identity === undefined) {
        return await originalFetch(input, init);
    }

    const canisterId = getCanisterId(input);
    const host = getHostFromBrowser();
    const actor = await createActor(identity, canisterId, host);

    const callResult = await call(input, init, actor);
    const response = createResponse(callResult);

    return response;
}

export { createActor } from './actor';
export { createAgent } from './agent';
export { getCanisterId };
export { getHostFromBrowser } from './host';
