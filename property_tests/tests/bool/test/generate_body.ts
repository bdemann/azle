import { CandidMeta } from 'azle/property_tests/arbitraries/candid/candid_arb';
import { Named } from 'azle/property_tests/arbitraries/query_method_arb';
import { areParamsCorrectlyOrdered } from 'azle/property_tests/are_params_correctly_ordered';

export function generateBody(
    namedParamBools: Named<CandidMeta<boolean>>[],
    returnBool: CandidMeta<boolean>
): string {
    // TODO do we want to encapsulate 'boolean' in the CandidArb? Like an agentType instead of a candidType, like azleValue and agentValue?
    // TODO or will this not matter anymore once we start using a deep equal library
    const paramsAreBooleans = namedParamBools
        .map((param) => {
            return `if (typeof ${param.name} !== 'boolean') throw new Error('${param.name} must be a boolean');`;
        })
        .join('\n');

    const paramsCorrectlyOrdered = areParamsCorrectlyOrdered(namedParamBools);

    const returnStatement = namedParamBools.reduce((acc, { name }) => {
        return `${acc} && ${name}`;
    }, returnBool.src.valueLiteral);

    return `
        ${paramsAreBooleans}

        ${paramsCorrectlyOrdered}

        return ${returnStatement};
    `;
}
