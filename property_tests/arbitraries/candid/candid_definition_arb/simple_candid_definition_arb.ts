import fc from 'fast-check';

import { Syntax } from '../../types';
import { BoolDefinitionArb } from '../primitive/bool';
import { Float32DefinitionArb } from '../primitive/floats/float32_arb';
import { Float64DefinitionArb } from '../primitive/floats/float64_arb';
import { IntDefinitionArb } from '../primitive/ints/int_arb';
import { Int8DefinitionArb } from '../primitive/ints/int8_arb';
import { Int16DefinitionArb } from '../primitive/ints/int16_arb';
import { Int32DefinitionArb } from '../primitive/ints/int32_arb';
import { Int64DefinitionArb } from '../primitive/ints/int64_arb';
import { NatDefinitionArb } from '../primitive/nats/nat_arb';
import { Nat8DefinitionArb } from '../primitive/nats/nat8_arb';
import { Nat16DefinitionArb } from '../primitive/nats/nat16_arb';
import { Nat32DefinitionArb } from '../primitive/nats/nat32_arb';
import { Nat64DefinitionArb } from '../primitive/nats/nat64_arb';
import { NullDefinitionArb } from '../primitive/null';
import { TextDefinitionArb } from '../primitive/text';
import { PrincipalDefinitionArb } from '../reference/principal_arb';
import { PrimitiveDefinition, WithShapesArb } from './types';

export type PrimitiveDefinitionWeights = Partial<{
    bool: number;
    float32: number;
    float64: number;
    int: number;
    int8: number;
    int16: number;
    int32: number;
    int64: number;
    nat: number;
    nat8: number;
    nat16: number;
    nat32: number;
    nat64: number;
    null: number;
    text: number;
    principal: number;
}>;

// The number of options below (bool, float32, float64, int, nat, etc)
export const PRIM_ARB_COUNT = 16;

const PRIM_DEF_WEIGHTS_DEFAULT = {};

export function primitiveCandidDefinitionArb(
    syntax: Syntax,
    constraints: PrimitiveDefinitionWeights = PRIM_DEF_WEIGHTS_DEFAULT
): WithShapesArb<PrimitiveDefinition> {
    return fc.oneof(
        { arbitrary: BoolDefinitionArb(syntax), weight: constraints.bool ?? 1 },
        {
            arbitrary: Float32DefinitionArb(syntax),
            weight: constraints.float32 ?? 1
        },
        {
            arbitrary: Float64DefinitionArb(syntax),
            weight: constraints.float64 ?? 1
        },
        { arbitrary: IntDefinitionArb(syntax), weight: constraints.int ?? 1 },
        { arbitrary: Int8DefinitionArb(syntax), weight: constraints.int8 ?? 1 },
        {
            arbitrary: Int16DefinitionArb(syntax),
            weight: constraints.int16 ?? 1
        },
        {
            arbitrary: Int32DefinitionArb(syntax),
            weight: constraints.int32 ?? 1
        },
        {
            arbitrary: Int64DefinitionArb(syntax),
            weight: constraints.int64 ?? 1
        },
        { arbitrary: NatDefinitionArb(syntax), weight: constraints.nat ?? 1 },
        { arbitrary: Nat8DefinitionArb(syntax), weight: constraints.nat8 ?? 1 },
        {
            arbitrary: Nat16DefinitionArb(syntax),
            weight: constraints.nat16 ?? 1
        },
        {
            arbitrary: Nat32DefinitionArb(syntax),
            weight: constraints.nat32 ?? 1
        },
        {
            arbitrary: Nat64DefinitionArb(syntax),
            weight: constraints.nat64 ?? 1
        },
        { arbitrary: NullDefinitionArb(syntax), weight: constraints.null ?? 1 },
        { arbitrary: TextDefinitionArb(syntax), weight: constraints.text ?? 1 },
        {
            arbitrary: PrincipalDefinitionArb(syntax),
            weight: constraints.principal ?? 1
        }
    );
}
