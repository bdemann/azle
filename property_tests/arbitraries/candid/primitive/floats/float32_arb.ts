import fc from 'fast-check';

import { Syntax } from '../../../types';
import {
    FloatCandidDefinition,
    WithShapesArb
} from '../../candid_definition_arb/types';
import { CandidValueAndMeta } from '../../candid_value_and_meta_arb';
import { CandidValueAndMetaArbGenerator } from '../../candid_value_and_meta_arb_generator';
import { CandidValues } from '../../candid_values_arb';
import { RecursiveShapes } from '../../recursive';
import { SimpleCandidDefinitionArb } from '../../simple_type_arbs/definition_arb';
import { SimpleCandidValuesArb } from '../../simple_type_arbs/values_arb';
import { floatToSrcLiteral } from '../../to_src_literal/float';

export interface Float32Constraints extends fc.Float32ArrayConstraints {
    noNegativeZero?: boolean;
}

export function Float32Arb(
    syntax: Syntax,
    constraints?: Float32Constraints
): fc.Arbitrary<CandidValueAndMeta<number>> {
    return CandidValueAndMetaArbGenerator(
        Float32DefinitionArb(syntax),
        Float32ValueArb,
        constraints
    );
}

export function Float32DefinitionArb(
    syntax: Syntax
): WithShapesArb<FloatCandidDefinition> {
    return SimpleCandidDefinitionArb('float32', syntax);
}

export function Float32ValueArb<C extends Float32Constraints>(
    _?: FloatCandidDefinition,
    _recShapes?: RecursiveShapes,
    constraints?: C
): fc.Arbitrary<CandidValues<number>> {
    return SimpleCandidValuesArb(float32(constraints), floatToSrcLiteral);
}

function float32(constraints?: Float32Constraints): fc.Arbitrary<number> {
    return fc
        .float32Array({ ...constraints, maxLength: 1, minLength: 1 })
        .map((sample) => {
            if (constraints?.noNegativeZero) {
                return sample[0] === 0 ? 0 : sample[0];
            }
            return sample[0];
        });
}
