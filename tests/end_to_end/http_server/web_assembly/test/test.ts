import { getCanisterId } from 'azle/dfx';
import { runTests } from 'azle/test';

import { getTests } from './tests';

const canisterName = 'web_assembly';
const canisterId = getCanisterId(canisterName);

runTests(getTests(canisterId), canisterName);
