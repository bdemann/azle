import { Agent } from '@dfinity/agent';
import { getActor, Named } from 'azle/property_tests';
import { CandidReturnType } from 'azle/property_tests/arbitraries/candid/candid_return_type_arb';
import { CandidValueAndMeta } from 'azle/property_tests/arbitraries/candid/candid_value_and_meta_arb';
import { CorrespondingJSType } from 'azle/property_tests/arbitraries/candid/corresponding_js_type';
import { Test, testEquality } from 'azle/property_tests/test';

import { InspectMessageBehavior } from './test';

export function generateTests(
    functionName: string,
    params: Named<CandidValueAndMeta<CorrespondingJSType>>[],
    returnType: CandidValueAndMeta<CandidReturnType>,
    agentAndBehaviors: [Agent, InspectMessageBehavior][]
): Test[][] {
    const paramValues = params.map(
        (param) => param.value.value.agentArgumentValue
    );

    const expectedResult = returnType.value.agentResponseValue;

    return [
        agentAndBehaviors.map(([agent, behavior]) => {
            return generateTest(
                agent,
                functionName,
                paramValues,
                expectedResult,
                behavior
            );
        })
    ];
}

function generateTest(
    agent: Agent,
    functionName: string,
    paramValues: CorrespondingJSType[],
    expectedResult: CorrespondingJSType,
    behavior: InspectMessageBehavior
): Test {
    return {
        name: `method "${functionName}" expected ${behavior}`,
        test: async () => {
            await agent.fetchRootKey();
            const actor = getActor(__dirname, agent);
            try {
                const result = await actor[functionName](...paramValues);

                if (behavior === 'ACCEPT') {
                    return testEquality(result, expectedResult);
                }

                return {
                    Err: 'Expected canister method to throw but it did not'
                };
            } catch (error: any) {
                if (behavior === 'RETURN') {
                    return testEquality(
                        error.message.includes('rejected the message'),
                        true
                    );
                }

                if (behavior === 'THROW') {
                    const expectedError = `Method \\"${functionName}\\" not allowed`;
                    return testEquality(
                        error.message.includes(expectedError),
                        true
                    );
                }

                throw error;
            }
        }
    };
}
