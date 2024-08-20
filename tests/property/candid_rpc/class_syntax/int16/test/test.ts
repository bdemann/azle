import { defaultArrayConstraints, runPropTests } from 'azle/property_tests';
import { Int16Arb } from 'azle/property_tests/arbitraries/candid/primitive/ints/int16_arb';
import {
    CanisterArb,
    CanisterConfig
} from 'azle/property_tests/arbitraries/canister_arb';
import { QueryMethodArb } from 'azle/property_tests/arbitraries/canister_methods/query_method_arb';
import fc from 'fast-check';

import { generateBody } from './generate_body';
import { generateTests } from './generate_tests';

const api = 'class';

const AllInt16sQueryMethodArb = QueryMethodArb(
    fc.array(Int16Arb(api)),
    Int16Arb(api),
    {
        generateBody,
        generateTests,
        api
    }
);

const CanisterConfigArb = fc
    .array(AllInt16sQueryMethodArb, defaultArrayConstraints)
    .map((queryMethods): CanisterConfig => {
        return { queryMethods };
    });

runPropTests(CanisterArb(CanisterConfigArb, api));
