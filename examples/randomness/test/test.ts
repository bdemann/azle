import { run_tests, Test } from 'azle/test';
import { createActor } from './dfx_generated/randomness';
import { get_tests } from './tests';

const randomness_canister = createActor('rrkah-fqaaa-aaaaa-aaaaq-cai', {
    agentOptions: {
        host: 'http://127.0.0.1:8000'
    }
});

run_tests(get_tests(randomness_canister));
