import fc from 'fast-check';
import { deepEqual } from 'fast-equals';

import { areParamsCorrectlyOrdered } from 'azle/property_tests/are_params_correctly_ordered';
import { CandidMeta } from 'azle/property_tests/arbitraries/candid/candid_arb';
import {
    Variant,
    VariantArb
} from 'azle/property_tests/arbitraries/candid/constructed/variant_arb';
import { CanisterArb } from 'azle/property_tests/arbitraries/canister_arb';
import { QueryMethodArb } from 'azle/property_tests/arbitraries/query_method_arb';
import { getActor, runPropTests } from 'azle/property_tests';
import { Test } from 'azle/test';

const UniqueVariantsArray = fc.uniqueArray(VariantArb, {
    selector: (entry) => entry.src.candidType
});

const AllVariantsQueryMethod = QueryMethodArb(UniqueVariantsArray, VariantArb, {
    generateBody,
    generateTests
});

runPropTests(CanisterArb(AllVariantsQueryMethod));

function generateBody(
    paramNames: string[],
    paramVariants: CandidMeta<Variant>[],
    returnVariant: CandidMeta<Variant>
): string {
    const paramsAreVariants = paramNames
        .map((paramName) => {
            return `if (typeof ${paramName} !== 'object' || Object.keys(${paramName}).length !== 1) throw new Error('${paramName} must be a Variant');`;
        })
        .join('\n');

    const paramsCorrectlyOrdered = areParamsCorrectlyOrdered(
        paramNames,
        paramVariants
    );

    const returnStatement = paramNames[0]
        ? `${paramNames[0]}`
        : returnVariant.src.valueLiteral;

    return `
        ${paramsCorrectlyOrdered}

        ${paramsAreVariants}

        return ${returnStatement};
    `;
}

function generateTests(
    functionName: string,
    paramVariants: CandidMeta<Variant>[],
    returnVariant: CandidMeta<Variant>
): Test[] {
    const expectedResult =
        paramVariants[0]?.agentResponseValue ??
        returnVariant.agentResponseValue;
    return [
        {
            name: `variant ${functionName}`,
            test: async () => {
                const actor = getActor('./tests/variant/test');

                const result = await actor[functionName](
                    ...paramVariants.map(
                        (variant) => variant.agentArgumentValue
                    )
                );

                return {
                    Ok: deepEqual(result, expectedResult)
                };
            }
        }
    ];
}
