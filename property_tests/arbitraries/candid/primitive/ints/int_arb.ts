import fc from 'fast-check';

import { Api } from '../../../types';
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

export function IntArb(api: Api): fc.Arbitrary<CandidValueAndMeta<bigint>> {
    return CandidValueAndMetaArbGenerator(IntDefinitionArb(api), IntValueArb);
}

export function IntDefinitionArb(api: Api): WithShapesArb<IntCandidDefinition> {
    return SimpleCandidDefinitionArb('int', api);
}

export function IntValueArb(): fc.Arbitrary<CandidValues<bigint>> {
    return SimpleCandidValuesArb(
        fc.bigInt(-1000000000000000000n, 1000000000000000000n), // TODO Remove min and max once https://github.com/second-state/wasmedge-quickjs/issues/125
        bigintToSrcLiteral
    );
}
