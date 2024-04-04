import { getCanisterId } from 'azle/dfx';
import { runTests } from 'azle/test';

import { createActor } from './dfx_generated/generics';
import { getTests } from './tests';

const genericsCanister = createActor(getCanisterId('generics'), {
    agentOptions: {
        host: 'http://127.0.0.1:8000'
    }
});

runTests(getTests(genericsCanister));
