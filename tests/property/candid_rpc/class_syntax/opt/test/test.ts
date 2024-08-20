import { defaultArrayConstraints, runPropTests } from 'azle/property_tests';
import { OptArb } from 'azle/property_tests/arbitraries/candid/constructed/opt_arb';
import {
    CanisterArb,
    CanisterConfig
} from 'azle/property_tests/arbitraries/canister_arb';
import { QueryMethodArb } from 'azle/property_tests/arbitraries/canister_methods/query_method_arb';
import fc from 'fast-check';

import { generateBody } from './generate_body';
import { generateTests } from './generate_tests';

const api = 'class';

const AllOptsQueryMethodArb = QueryMethodArb(
    fc.array(OptArb(api)),
    OptArb(api),
    {
        generateBody,
        generateTests,
        api
    }
);

const CanisterConfigArb = fc
    .array(AllOptsQueryMethodArb, defaultArrayConstraints)
    .map((queryMethods): CanisterConfig => {
        return { queryMethods };
    });

runPropTests(CanisterArb(CanisterConfigArb, api));
