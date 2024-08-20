import { defaultArrayConstraints, runPropTests } from 'azle/property_tests';
import { Int64Arb } from 'azle/property_tests/arbitraries/candid/primitive/ints/int64_arb';
import {
    CanisterArb,
    CanisterConfig
} from 'azle/property_tests/arbitraries/canister_arb';
import { QueryMethodArb } from 'azle/property_tests/arbitraries/canister_methods/query_method_arb';
import fc from 'fast-check';

import { generateBody } from './generate_body';
import { generateTests } from './generate_tests';

const api = 'functional';

const AllInt64sQueryMethodArb = QueryMethodArb(
    fc.array(Int64Arb(api)),
    Int64Arb(api),
    {
        generateBody,
        generateTests,
        api
    }
);

const CanisterConfigArb = fc
    .array(AllInt64sQueryMethodArb, defaultArrayConstraints)
    .map((queryMethods): CanisterConfig => {
        return { queryMethods };
    });

runPropTests(CanisterArb(CanisterConfigArb, api));
