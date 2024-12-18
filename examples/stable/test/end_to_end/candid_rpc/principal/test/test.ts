import { getCanisterId } from 'azle/dfx';
import { runTests } from 'azle/test';
import { getTests } from 'principal_end_to_end_test_functional_syntax/test/tests';

import { createActor } from './dfx_generated/principal';

const canisterName = 'principal';
const principalCanister = createActor(getCanisterId(canisterName), {
    agentOptions: {
        host: 'http://127.0.0.1:8000'
    }
});

runTests(getTests(principalCanister), canisterName);