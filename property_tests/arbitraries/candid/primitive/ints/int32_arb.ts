import fc from 'fast-check';

import { Syntax } from '../../../types';
import {
    IntCandidDefinition,
    WithShapesArb
} from '../../candid_definition_arb/types';
import { CandidValueAndMeta } from '../../candid_value_and_meta_arb';
import { CandidValueAndMetaArbGenerator } from '../../candid_value_and_meta_arb_generator';
import { CandidValues } from '../../candid_values_arb';
import { SimpleCandidDefinitionArb } from '../../simple_type_arbs/definition_arb';
import { SimpleCandidValuesArb } from '../../simple_type_arbs/values_arb';
import { numberToSrcLiteral } from '../../to_src_literal/number';
import { NumberArb } from '.';

export function Int32Arb(
    syntax: Syntax
): fc.Arbitrary<CandidValueAndMeta<number>> {
    return CandidValueAndMetaArbGenerator(
        Int32DefinitionArb(syntax),
        Int32ValueArb
    );
}

export function Int32DefinitionArb(
    syntax: Syntax
): WithShapesArb<IntCandidDefinition> {
    return SimpleCandidDefinitionArb('int32', syntax);
}

export function Int32ValueArb(): fc.Arbitrary<CandidValues<number>> {
    return SimpleCandidValuesArb(NumberArb(32), numberToSrcLiteral);
}
