import { getActor, Named } from 'azle/test/property';
import { CandidValueAndMeta } from 'azle/test/property/arbitraries/candid/candid_value_and_meta_arb';
import { AzleResult, Test, testEquality } from 'azle/test/property/test';

export function generateTests(
    functionName: string,
    namedParamFloat64s: Named<CandidValueAndMeta<number>>[],
    returnFloat64: CandidValueAndMeta<number>
): Test[][] {
    const count = namedParamFloat64s.length + 1;
    const expectedResult =
        namedParamFloat64s.reduce(
            (acc, param) => acc + param.value.value.agentResponseValue,
            returnFloat64.value.agentResponseValue
        ) / count;

    const paramValues = namedParamFloat64s.map(
        (param) => param.value.value.agentArgumentValue
    );

    return [
        [
            {
                name: `float64 ${functionName}`,
                test: async (): Promise<AzleResult> => {
                    const actor = getActor(__dirname);

                    const result = await actor[functionName](...paramValues);

                    return testEquality(result, expectedResult);
                }
            }
        ]
    ];
}
