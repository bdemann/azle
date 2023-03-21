import {
    InsertError,
    nat64,
    Opt,
    Principal,
    $query,
    StableBTreeMap,
    $update,
    Variant
} from 'azle';

type StableMap13InsertResult = Variant<{
    Ok: Opt<Principal>;
    Err: InsertError;
}>;

let stableMap13 = new StableBTreeMap<string, Principal>(13, 100, 1_000);

$query;
export function stableMap13ContainsKey(key: string): boolean {
    return stableMap13.containsKey(key);
}

$query;
export function stableMap13Get(key: string): Opt<Principal> {
    return stableMap13.get(key);
}

$update;
export function stableMap13Insert(
    key: string,
    value: Principal
): StableMap13InsertResult {
    return stableMap13.insert(key, value);
}

$query;
export function stableMap13IsEmpty(): boolean {
    return stableMap13.isEmpty();
}

$query;
export function stableMap13Items(): [string, Principal][] {
    return stableMap13.items();
}

$query;
export function stableMap13Keys(): string[] {
    return stableMap13.keys();
}

$query;
export function stableMap13Len(): nat64 {
    return stableMap13.len();
}

$update;
export function stableMap13Remove(key: string): Opt<Principal> {
    return stableMap13.remove(key);
}

$query;
export function stableMap13Values(): Principal[] {
    return stableMap13.values();
}