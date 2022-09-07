import {
    blob,
    float32,
    float64,
    int16,
    int32,
    int64,
    int8,
    nat,
    nat16,
    nat32,
    nat64,
    nat8,
    Opt,
    Principal,
    Query,
    Update,
    empty,
    int,
    reserved,
    Variant
} from 'azle';

// type InlineExample = {
//     // first_field: { one: boolean; two: string };
//     second_field: { one: boolean; two: { thing: string } };
//     // third_field: { one: boolean; two: string };
// };

// export function inline_query(param: InlineExample): Query<void> {}

export function simple_query(
    number: Opt<nat64>,
    string: string,
    otherthing: nat,
    boolThing: boolean
): Query<string> {
    return 'This is a query function';
}

type TypeAliasOfATypeRef = nat8;

type SimpleTypeAlias = boolean;

type Boolean = boolean;
type Boolean2 = Boolean;
type Boolean3 = Boolean2;

type BooleanArray = Boolean[];

type SimpleRecord = {
    one: boolean;
    other: BooleanArray;
};

type Unused3 = boolean;

type Unused2 = Unused3;

type Unused = Unused2;

type UsedType = Unused;

type DeepInlineRecords = {
    one: { thing: boolean };
    six: { one: string; two: SimpleRecord };
};

type RecordWithoutDirectInlineRecords = {
    one: DeepInlineRecords;
};

type TypeAliasOnlyUsedInline = {
    one: boolean;
};

type ComplexRecord = {
    one: nat16;
    two: boolean;
    three: SimpleTypeAlias;
    four: Boolean[];
    five: SimpleRecord[];
    six: { one: string; two: SimpleRecord };
    seven: RecordWithoutDirectInlineRecords;
};

export function complex_record_test(
    param: ComplexRecord,
    simple: SimpleRecord,
    other: UsedType,
    inline_test1: {
        one: string;
        two: SimpleRecord;
        three: UsedType;
    },
    other_inline_test2: {
        one: boolean;
        two: nat16;
        three: ComplexRecord;
    },
    inline_test: {
        one: string;
        two: SimpleRecord;
        three: { sub_one: boolean; sub_two: UsedType };
        four: { sub_one: boolean; sub_two: { sub_three: UsedType } };
    },
    other_inline_test: {
        one: { one_inline: boolean };
        two: { two_inline: nat16 };
        three: { three_inline: ComplexRecord };
    },
    inline_with_type_alias_dependency: {
        one: TypeAliasOnlyUsedInline;
    }
): Query<TypeAliasOfATypeRef> {
    return 1;
}

type Fun = Variant<{
    id?: null;
    cool?: null;
}>;

export function one_variant(thing: Fun): Query<void> {
    one_variant({ cool: null, id: null });
}

export function various_variants(thing: Yes, thing2: Reaction): Query<string> {
    return 'hello';
}

type Yes = Variant<{
    One?: null;
    Two?: null;
    Three?: null;
}>;

type Reaction = Variant<{
    Fire?: null;
    Great?: null;
    // Good?: Good;
    Fun?: Fun;
}>;

// type Good = {
//     id: string;
// };

// TODO implement default for inline types
// export function in_line(param: { one: nat16; two: nat16 }): Query<{
//     one: string;
//     two: { two_a: { two_a_i: nat16 }; two_b: boolean };
// }> {
//     return {
//         one: 'hello',
//         two: {
//             two_a: {
//                 two_a_i: 2
//             },
//             two_b: false
//         }
//     };
// }

export function not_so_simple(
    one: int8[],
    two: int16,
    three: int32,
    four: int64,
    five: nat8,
    six: nat16,
    seven: nat32,
    eight: nat64,
    nine: blob,
    ten: float32,
    eleven: float64,
    twelve: Principal,
    thirteen: null,
    fourteen: { thing: string }
): Update<void> {}

// TODO Why can't we do 2d arrays of principals??
// export function getPrincipals(principal_lists: Principal[][]): Update<void> {}
