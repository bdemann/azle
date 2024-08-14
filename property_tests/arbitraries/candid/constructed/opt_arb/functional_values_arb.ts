import fc from 'fast-check';

import { DEFAULT_VALUE_MAX_DEPTH } from '../../../config';
import { Syntax } from '../../../types';
import { OptCandidDefinition } from '../../candid_definition_arb/types';
import {
    CandidValueArb,
    CandidValueConstraints,
    CandidValues
} from '../../candid_values_arb';
import { CorrespondingJSType } from '../../corresponding_js_type';
import { RecursiveShapes } from '../../recursive';
import { Opt } from '.';

type SomeOrNone = 'Some' | 'None';
const syntax = 'functional';

export function FunctionalOptValuesArb(
    optDefinition: OptCandidDefinition,
    recursiveShapes: RecursiveShapes,
    constraints: CandidValueConstraints = {
        depthLevel: DEFAULT_VALUE_MAX_DEPTH
    }
): fc.Arbitrary<CandidValues<Opt>> {
    const depthLevel = constraints?.depthLevel ?? DEFAULT_VALUE_MAX_DEPTH;
    if (depthLevel < 1) {
        return fc.constant(generateNoneValue(syntax));
    }
    const innerValue = fc.tuple(
        fc.constantFrom('Some', 'None') as fc.Arbitrary<SomeOrNone>,
        CandidValueArb(optDefinition.innerType, recursiveShapes, {
            ...constraints,
            depthLevel: depthLevel - 1
        })
    );

    return innerValue.map(([someOrNone, innerType]) => {
        const valueLiteral = generateValueLiteral(
            someOrNone,
            innerType,
            syntax
        );
        const agentArgumentValue = generateValue(someOrNone, innerType);
        const agentResponseValue = generateValue(someOrNone, innerType, true);

        return {
            valueLiteral,
            agentArgumentValue,
            agentResponseValue
        };
    });
}

function generateNoneValue(syntax: Syntax): CandidValues<Opt> {
    return {
        valueLiteral: syntax === 'functional' ? 'None' : '[]',
        agentArgumentValue: [],
        agentResponseValue: []
    };
}

function generateValue(
    someOrNone: SomeOrNone,
    innerType: CandidValues<CorrespondingJSType>,
    useAgentResponseValue: boolean = false
): Opt {
    if (someOrNone === 'Some') {
        return [
            useAgentResponseValue
                ? innerType.agentResponseValue
                : innerType.agentArgumentValue
        ];
    } else {
        return [];
    }
}

function generateValueLiteral(
    someOrNone: SomeOrNone,
    innerType: CandidValues<CorrespondingJSType>,
    syntax: Syntax
): string {
    if (someOrNone === 'Some') {
        return syntax === 'functional'
            ? `Some(${innerType.valueLiteral})`
            : `[${innerType.valueLiteral}]`;
    } else {
        return syntax === 'functional' ? `None` : '[]';
    }
}
