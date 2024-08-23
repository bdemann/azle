import { defaultArrayConstraints, runPropTests } from 'azle/property_tests';
import { Float64Arb } from 'azle/property_tests/arbitraries/candid/primitive/floats/float64_arb';
import {
    CanisterArb,
    CanisterConfig
} from 'azle/property_tests/arbitraries/canister_arb';
import { QueryMethodArb } from 'azle/property_tests/arbitraries/canister_methods/query_method_arb';
import { Api } from 'azle/property_tests/arbitraries/types';
import fc from 'fast-check';

import { generateBody } from './generate_body';
import { generateTests } from './generate_tests';

const api: Api = 'functional';
const context = { api, constraints: {} };

const AllFloat64sQueryMethodArb = QueryMethodArb(
    {
        api,
        constraints: {}
    },
    {
        generateBody,
        generateTests
    },
    fc.array(Float64Arb(context)),
    Float64Arb(context)
);

const CanisterConfigArb = fc
    .array(AllFloat64sQueryMethodArb, defaultArrayConstraints)
    .map((queryMethods): CanisterConfig => {
        return { queryMethods };
    });

runPropTests(CanisterArb(context, CanisterConfigArb));
