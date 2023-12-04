import fc from 'fast-check';

import { CandidMeta } from '../../candid_arb';
import { CandidType } from '../../candid_type_arb';
import { UniqueIdentifierArb } from '../../../unique_identifier_arb';
import { ReturnTuple, Tuple } from './index';

export function TupleArb(candidTypeArb: fc.Arbitrary<CandidMeta<CandidType>>) {
    return fc
        .tuple(
            UniqueIdentifierArb('typeDeclaration'),
            fc.array(candidTypeArb, {
                minLength: 1
            }),
            fc.boolean()
        )
        .map(
            ([name, fields, useTypeDeclaration]): CandidMeta<
                Tuple,
                ReturnTuple
            > => {
                const { candidTypeObject, candidType } = useTypeDeclaration
                    ? {
                          candidTypeObject: name,
                          candidType: `typeof ${name}.tsType`
                      }
                    : generateCandidType(fields);

                const typeDeclaration = generateTypeDeclaration(
                    name,
                    fields,
                    useTypeDeclaration
                );

                const imports = generateImports(fields);

                const valueLiteral = generateValueLiteral(fields);

                const agentArgumentValue = generateVale(fields);

                const agentResponseValue = generateExpectedValue(fields);

                return {
                    src: {
                        candidTypeObject,
                        candidType,
                        typeDeclaration,
                        imports,
                        valueLiteral
                    },
                    agentArgumentValue,
                    agentResponseValue
                };
            }
        );
}

function generateVale(fields: CandidMeta<CandidType>[]) {
    return fields.map((field) => field.agentArgumentValue);
}

function generateExpectedValue(fields: CandidMeta<CandidType>[]): ReturnTuple {
    if (fields.length === 0) {
        return {};
    }
    return fields.map((field) => field.agentResponseValue);
}

function generateTypeDeclaration(
    name: string,
    fields: CandidMeta<CandidType>[],
    useTypeDeclaration: boolean
): string {
    const fieldTypeDeclarations = fields
        .map((field) => field.src.typeDeclaration)
        .join('\n');
    if (useTypeDeclaration) {
        return `${fieldTypeDeclarations}\nconst ${name} = ${
            generateCandidType(fields).candidTypeObject
        };`;
    }
    return fieldTypeDeclarations;
}

function generateCandidType(fields: CandidMeta<CandidType>[]): {
    candidTypeObject: string;
    candidType: string;
} {
    const innerCandidTypeObjects = fields.map(
        (field) => field.src.candidTypeObject
    );
    const innerCandidTypes = fields.map((field) => field.src.candidType);

    return {
        candidTypeObject: `Tuple(${innerCandidTypeObjects.join(', ')})`,
        candidType: `Tuple<[${innerCandidTypes.join(', ')}]>`
    };
}

function generateImports(fields: CandidMeta<CandidType>[]): Set<string> {
    const fieldImports = fields.flatMap((field) => [...field.src.imports]);
    return new Set([...fieldImports, 'Tuple']);
}

function generateValueLiteral(fields: CandidMeta<CandidType>[]) {
    const fieldLiterals = fields
        .map((field) => field.src.valueLiteral)
        .join(',\n');

    return `[
        ${fieldLiterals}
    ]`;
}
