import { defaultArrayConstraints, runPropTests } from 'azle/property_tests';
import { RecursiveArb } from 'azle/property_tests/arbitraries/candid/recursive';
import {
    CanisterArb,
    CanisterConfig
} from 'azle/property_tests/arbitraries/canister_arb';
import { QueryMethodArb } from 'azle/property_tests/arbitraries/canister_methods/query_method_arb';
import { UpdateMethodArb } from 'azle/property_tests/arbitraries/canister_methods/update_method_arb';
import fc from 'fast-check';

import { generateBody } from './generate_body';
import { generateTests } from './generate_tests';

const api = 'functional';

const AllRecursiveQueryMethodArb = fc.oneof(
    QueryMethodArb(fc.array(RecursiveArb(api)), RecursiveArb(api), {
        generateBody,
        generateTests,
        api
    }),
    UpdateMethodArb(fc.array(RecursiveArb(api)), RecursiveArb(api), {
        generateBody,
        generateTests,
        api
    })
);

const CanisterConfigArb = fc
    .array(AllRecursiveQueryMethodArb, defaultArrayConstraints)
    .map((queryMethods): CanisterConfig => {
        return { queryMethods };
    });

runPropTests(CanisterArb(CanisterConfigArb, api), true);
