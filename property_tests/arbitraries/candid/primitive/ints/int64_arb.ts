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
import { bigintToSrcLiteral } from '../../to_src_literal/bigint';

export function Int64Arb(
    syntax: Syntax
): fc.Arbitrary<CandidValueAndMeta<bigint>> {
    return CandidValueAndMetaArbGenerator(
        Int64DefinitionArb(syntax),
        Int64ValueArb
    );
}

export function Int64DefinitionArb(
    syntax: Syntax
): WithShapesArb<IntCandidDefinition> {
    return SimpleCandidDefinitionArb('int64', syntax);
}

export function Int64ValueArb(): fc.Arbitrary<CandidValues<bigint>> {
    return SimpleCandidValuesArb(fc.bigIntN(60), bigintToSrcLiteral); // TODO set back to 64 once https://github.com/second-state/wasmedge-quickjs/issues/125
}
