import { getCanisterId } from 'azle/dfx';
import { runTests } from 'azle/test';

import { createActor } from './dfx_generated/randomness';
import { getTests } from './tests';

const canisterName = 'randomness';
const randomnessCanister = createActor(getCanisterId(canisterName), {
    agentOptions: {
        host: 'http://127.0.0.1:8000'
    }
});

runTests(getTests(randomnessCanister), canisterName);
