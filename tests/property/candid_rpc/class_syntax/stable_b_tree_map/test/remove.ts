import { getActor } from 'azle/property_tests';
import { QueryMethod } from 'azle/property_tests/arbitraries/canister_methods/query_method_arb';
import { StableBTreeMap } from 'azle/property_tests/arbitraries/stable_b_tree_map_arb';
import { UniqueIdentifierArb } from 'azle/property_tests/arbitraries/unique_identifier_arb';
import { AzleResult, Test, testEquality } from 'azle/property_tests/test';
import fc from 'fast-check';

export function RemoveTestArb(
    stableBTreeMap: StableBTreeMap
): fc.Arbitrary<QueryMethod> {
    return fc
        .tuple(UniqueIdentifierArb('canisterProperties'))
        .map(([functionName]): QueryMethod => {
            const imports = new Set([
                ...stableBTreeMap.imports,
                'IDL',
                'update'
            ]);

            const paramTypeObjects = [
                stableBTreeMap.keySample.src.typeObject
            ].join(', ');

            const paramNames = [
                `param0: ${stableBTreeMap.keySample.src.typeAnnotation}`
            ].join(', ');

            const returnTypeObject = `IDL.Opt(${stableBTreeMap.valueSample.src.typeObject})`;
            const returnTypeAnnotation = `[${stableBTreeMap.valueSample.src.typeAnnotation}] | []`;
            const valueTypeIsNull =
                stableBTreeMap.valueSample.src.typeAnnotation === 'null';
            const body = generateBody(stableBTreeMap.name, valueTypeIsNull);

            const tests = generateTests(
                functionName,
                stableBTreeMap.keySample.value.agentArgumentValue,
                stableBTreeMap.valueSample.value.agentArgumentValue
            );

            return {
                imports,
                globalDeclarations: [],
                sourceCode: `@update([${paramTypeObjects}], ${returnTypeObject})
                ${functionName}(${paramNames}): ${returnTypeAnnotation} {
                ${body}
            }`,
                tests
            };
        });
}

function generateBody(
    stableBTreeMapName: string,
    valueTypeIsNull: boolean
): string {
    return /*TS*/ `
        ${
            valueTypeIsNull
                ? `const containsKey = ${stableBTreeMapName}.containsKey(param0);`
                : ''
        }
        const result = ${stableBTreeMapName}.remove(param0);
        if (result === null ${valueTypeIsNull ? '&& !containsKey' : ''}) {
            return []
        } else {
            return [result]
        }
    `;
}

function generateTests(
    functionName: string,
    keySampleAgentArgumentValue: StableBTreeMap['keySample']['value']['agentArgumentValue'],
    valueSampleAgentArgumentValue: StableBTreeMap['valueSample']['value']['agentArgumentValue']
): Test[][] {
    return [
        [],
        [
            {
                name: `remove after second deploy ${functionName}`,
                test: async (): Promise<AzleResult> => {
                    const actor = getActor(__dirname);

                    const result = await actor[functionName](
                        keySampleAgentArgumentValue
                    );

                    return testEquality(result, [
                        valueSampleAgentArgumentValue
                    ]);
                }
            }
        ]
    ];
}
