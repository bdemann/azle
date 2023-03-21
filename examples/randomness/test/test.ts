import { runTests } from 'azle/test';
import { createActor } from './dfx_generated/randomness';
import { getTests } from './tests';

const randomnessCanister = createActor('rrkah-fqaaa-aaaaa-aaaaq-cai', {
    agentOptions: {
        host: 'http://127.0.0.1:8000'
    }
});

runTests(getTests(randomnessCanister));