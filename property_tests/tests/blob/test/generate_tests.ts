import { deepEqual } from 'fast-equals';

import { getActor } from 'azle/property_tests';
import { CandidMeta } from 'azle/property_tests/arbitraries/candid/candid_arb';
import { Named } from 'azle/property_tests/arbitraries/query_method_arb';
import { Test } from 'azle/test';

export function generateTests(
    functionName: string,
    paramBlobs: Named<CandidMeta<Uint8Array>>[],
    returnBlob: CandidMeta<Uint8Array>
): Test[] {
    const expectedResult = Uint8Array.from(
        paramBlobs
            .map((blob) => blob.el.agentResponseValue)
            .reduce(
                (acc, blob) => [...acc, ...blob],
                [...returnBlob.agentResponseValue]
            )
    );

    return [
        {
            name: `blob ${functionName}`,
            test: async () => {
                const actor = getActor('./tests/blob/test');

                const result = await actor[functionName](
                    ...paramBlobs.map((blob) => blob.el.agentArgumentValue)
                );

                return {
                    Ok: deepEqual(result, expectedResult)
                };
            }
        }
    ];
}
