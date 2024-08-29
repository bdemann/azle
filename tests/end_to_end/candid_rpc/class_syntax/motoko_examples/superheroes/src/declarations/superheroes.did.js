export const idlFactory = ({ IDL }) => {
    const rec_0 = IDL.Rec();
    rec_0.fill(IDL.Tuple(IDL.Text, IDL.Opt(rec_0)));
    return IDL.Service({
        create: IDL.Func(
            [IDL.Record({ superpowers: IDL.Opt(rec_0), name: IDL.Text })],
            [IDL.Nat32],
            []
        ),
        deleteHero: IDL.Func([IDL.Nat32], [IDL.Bool], []),
        read: IDL.Func(
            [IDL.Nat32],
            [
                IDL.Opt(
                    IDL.Record({ superpowers: IDL.Opt(rec_0), name: IDL.Text })
                )
            ],
            ['query']
        ),
        update: IDL.Func(
            [
                IDL.Nat32,
                IDL.Record({ superpowers: IDL.Opt(rec_0), name: IDL.Text })
            ],
            [IDL.Bool],
            []
        )
    });
};
export const init = ({ IDL }) => {
    return [];
};
