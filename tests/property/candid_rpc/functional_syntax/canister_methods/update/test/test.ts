import { defaultArrayConstraints, runPropTests } from 'azle/property_tests';
import { CandidReturnTypeArb } from 'azle/property_tests/arbitraries/candid/candid_return_type_arb';
import { CandidValueAndMetaArb } from 'azle/property_tests/arbitraries/candid/candid_value_and_meta_arb';
import {
    CanisterArb,
    CanisterConfig
} from 'azle/property_tests/arbitraries/canister_arb';
import { UpdateMethodArb } from 'azle/property_tests/arbitraries/canister_methods/update_method_arb';
import fc from 'fast-check';

import { generateBody } from './generate_body';
import { generateTests } from './generate_tests';

const api = 'functional';

const HeterogeneousUpdateMethodArb = UpdateMethodArb(
    fc.array(CandidValueAndMetaArb(api)),
    CandidReturnTypeArb(api),
    {
        generateBody,
        generateTests,
        api
    }
);

const CanisterConfigArb = fc
    .array(HeterogeneousUpdateMethodArb, defaultArrayConstraints)
    .map((queryMethods): CanisterConfig => {
        return { queryMethods };
    });

runPropTests(CanisterArb(CanisterConfigArb, api));
