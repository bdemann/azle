export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'getFloat32' : IDL.Func([], [IDL.Float32], ['query']),
    'getFloat64' : IDL.Func([], [IDL.Float64], ['query']),
    'getInt' : IDL.Func([], [IDL.Int], ['query']),
    'getInt16' : IDL.Func([], [IDL.Int16], ['query']),
    'getInt32' : IDL.Func([], [IDL.Int32], ['query']),
    'getInt64' : IDL.Func([], [IDL.Int64], ['query']),
    'getInt8' : IDL.Func([], [IDL.Int8], ['query']),
    'getNat' : IDL.Func([], [IDL.Nat], ['query']),
    'getNat16' : IDL.Func([], [IDL.Nat16], ['query']),
    'getNat32' : IDL.Func([], [IDL.Nat32], ['query']),
    'getNat64' : IDL.Func([], [IDL.Nat64], ['query']),
    'getNat8' : IDL.Func([], [IDL.Nat8], ['query']),
    'getPrincipal' : IDL.Func([], [IDL.Principal], ['query']),
    'printFloat32' : IDL.Func([IDL.Float32], [IDL.Float32], ['query']),
    'printFloat64' : IDL.Func([IDL.Float64], [IDL.Float64], ['query']),
    'printInt' : IDL.Func([IDL.Int], [IDL.Int], ['query']),
    'printInt16' : IDL.Func([IDL.Int16], [IDL.Int16], ['query']),
    'printInt32' : IDL.Func([IDL.Int32], [IDL.Int32], ['query']),
    'printInt64' : IDL.Func([IDL.Int64], [IDL.Int64], ['query']),
    'printInt8' : IDL.Func([IDL.Int8], [IDL.Int8], ['query']),
    'printNat' : IDL.Func([IDL.Nat], [IDL.Nat], ['query']),
    'printNat16' : IDL.Func([IDL.Nat16], [IDL.Nat16], ['query']),
    'printNat32' : IDL.Func([IDL.Nat32], [IDL.Nat32], ['query']),
    'printNat64' : IDL.Func([IDL.Nat64], [IDL.Nat64], ['query']),
    'printNat8' : IDL.Func([IDL.Nat8], [IDL.Nat8], ['query']),
    'printPrincipal' : IDL.Func([IDL.Principal], [IDL.Principal], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };