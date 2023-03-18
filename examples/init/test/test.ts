import { run_tests } from 'azle/test';
import { createActor } from '../test/dfx_generated/init';
import { getTests } from './tests';

const init_canister = createActor('rrkah-fqaaa-aaaaa-aaaaq-cai', {
    agentOptions: {
        host: 'http://127.0.0.1:8000'
    }
});

run_tests(getTests(init_canister));
