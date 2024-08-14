import { getActor, Named } from 'azle/property_tests';
import { CandidReturnType } from 'azle/property_tests/arbitraries/candid/candid_return_type_arb';
import { CandidValueAndMeta } from 'azle/property_tests/arbitraries/candid/candid_value_and_meta_arb';
import { CorrespondingJSType } from 'azle/property_tests/arbitraries/candid/corresponding_js_type';
import { AzleResult, Test, testEquality } from 'azle/property_tests/test';

export function generateTests(
    functionName: string,
    params: Named<CandidValueAndMeta<CorrespondingJSType>>[],
    returnType: CandidValueAndMeta<CandidReturnType>
): Test[][] {
    const paramValues = params.map(
        (param) => param.value.value.agentArgumentValue
    );
    const expectedResult = returnType.value.agentResponseValue;

    return [
        [
            {
                name: `update method "${functionName}"`,
                test: async (): Promise<AzleResult> => {
                    const actor = getActor(__dirname);
                    const result = await actor[functionName](...paramValues);

                    return testEquality(result, expectedResult);
                }
            }
        ]
    ];
}
