import { defaultArrayConstraints, runPropTests } from 'azle/property_tests';
import { PrincipalArb } from 'azle/property_tests/arbitraries/candid/reference/principal_arb';
import {
    CanisterArb,
    CanisterConfig
} from 'azle/property_tests/arbitraries/canister_arb';
import { QueryMethodArb } from 'azle/property_tests/arbitraries/canister_methods/query_method_arb';
import fc from 'fast-check';

import { generateBody } from './generate_body';
import { generateTests } from './generate_tests';

const api = 'functional';

const AllPrincipalsQueryMethodArb = QueryMethodArb(
    fc.array(PrincipalArb(api)),
    PrincipalArb(api),
    {
        generateBody,
        generateTests,
        api
    }
);

const CanisterConfigArb = fc
    .array(AllPrincipalsQueryMethodArb, defaultArrayConstraints)
    .map((queryMethods): CanisterConfig => {
        return { queryMethods };
    });

runPropTests(CanisterArb(CanisterConfigArb, api));
