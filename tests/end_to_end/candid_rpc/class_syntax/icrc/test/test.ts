import { getCanisterId } from 'azle/dfx';
import { runTests } from 'azle/test';
import { getTests } from 'icrc_end_to_end_test_functional_syntax/test/tests';

import { createActor } from '../test/dfx_generated/proxy';

const canisterName = 'proxy';
const proxyCanister = createActor(getCanisterId(canisterName), {
    agentOptions: {
        host: 'http://127.0.0.1:8000'
    }
});

runTests(getTests(proxyCanister), canisterName);
