import { defaultArrayConstraints, runPropTests } from 'azle/property_tests';
import { NatArb } from 'azle/property_tests/arbitraries/candid/primitive/nats/nat_arb';
import {
    CanisterArb,
    CanisterConfig
} from 'azle/property_tests/arbitraries/canister_arb';
import { QueryMethodArb } from 'azle/property_tests/arbitraries/canister_methods/query_method_arb';
import fc from 'fast-check';

import { generateBody } from './generate_body';
import { generateTests } from './generate_tests';

const api = 'class';

const AllNatsQueryMethodArb = QueryMethodArb(
    fc.array(NatArb(api)),
    NatArb(api),
    {
        generateBody,
        generateTests,
        api
    }
);

const CanisterConfigArb = fc
    .array(AllNatsQueryMethodArb, defaultArrayConstraints)
    .map((queryMethods): CanisterConfig => {
        return { queryMethods };
    });

runPropTests(CanisterArb(CanisterConfigArb, api));
