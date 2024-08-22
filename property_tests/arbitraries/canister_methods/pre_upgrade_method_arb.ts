import fc from 'fast-check';

import { Test } from '../../test';
import { VoidArb } from '../candid/primitive/void';
import { Context } from '../types';
import { UniqueIdentifierArb } from '../unique_identifier_arb';
import {
    BodyGenerator,
    generateMethodImplementation,
    MethodImplementationLocation,
    MethodImplementationLocationArb,
    TestsGenerator
} from '.';

export type PreUpgradeMethod = {
    imports: Set<string>;
    globalDeclarations: string[];
    sourceCode: string;
    tests: Test[][];
};

export function PreUpgradeMethodArb(
    context: Context<{
        generateBody: BodyGenerator;
        generateTests: TestsGenerator;
        methodImplementationLocation?: MethodImplementationLocation;
    }>
): fc.Arbitrary<PreUpgradeMethod> {
    const api = context.api;
    const constraints = context.constraints;
    return fc
        .tuple(
            UniqueIdentifierArb('canisterProperties'),
            VoidArb(context),
            MethodImplementationLocationArb,
            UniqueIdentifierArb('globalNames')
            // TODO: This unique id would be better named globalScope or something
            // But needs to match the same scope as typeDeclarations so I'm using
            // that for now.
        )
        .map(
            ([
                functionName,
                returnType,
                defaultMethodImplementationLocation,
                methodName
            ]): PreUpgradeMethod => {
                const methodImplementationLocation =
                    api === 'class'
                        ? 'INLINE'
                        : constraints.methodImplementationLocation ??
                          defaultMethodImplementationLocation;

                const imports = new Set(['preUpgrade']);

                const methodImplementation = generateMethodImplementation(
                    [],
                    returnType,
                    constraints.generateBody,
                    methodImplementationLocation,
                    methodName,
                    api
                );

                const globalDeclarations =
                    methodImplementationLocation === 'STANDALONE'
                        ? [methodImplementation]
                        : [];

                const sourceCode =
                    api === 'functional'
                        ? `${functionName}: preUpgrade(${
                              methodImplementationLocation === 'STANDALONE'
                                  ? methodName
                                  : methodImplementation
                          })`
                        : `@preUpgrade\n${functionName}${methodImplementation}`;

                const tests = constraints.generateTests(
                    functionName,
                    [],
                    returnType
                );

                return {
                    imports,
                    globalDeclarations,
                    sourceCode,
                    tests
                };
            }
        );
}
