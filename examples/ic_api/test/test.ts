import { run_tests } from 'azle/test';
import { createActor } from './dfx_generated/ic_api';
import { getTests } from './tests';

const ic_api_canister = createActor('rrkah-fqaaa-aaaaa-aaaaq-cai', {
    agentOptions: {
        host: 'http://127.0.0.1:8000'
    }
});

run_tests(getTests(ic_api_canister as any));
