import {
    float64,
    InsertError,
    nat64,
    Opt,
    $query,
    StableBTreeMap,
    $update,
    Variant
} from 'azle';

type StableMap5InsertResult = Variant<{
    Ok: Opt<float64>;
    Err: InsertError;
}>;

let stableMap5 = new StableBTreeMap<Opt<String>, float64>(5, 100, 1_000);

$query;
export function stableMap5ContainsKey(key: Opt<String>): boolean {
    return stableMap5.containsKey(key);
}

$query;
export function stableMap5Get(key: Opt<String>): Opt<float64> {
    return stableMap5.get(key);
}

$update;
export function stableMap5Insert(
    key: Opt<String>,
    value: float64
): StableMap5InsertResult {
    return stableMap5.insert(key, value);
}

$query;
export function stableMap5IsEmpty(): boolean {
    return stableMap5.isEmpty();
}

$query;
export function stableMap5Items(): [Opt<String>, float64][] {
    return stableMap5.items();
}

$query;
export function stableMap5Keys(): Opt<String>[] {
    return stableMap5.keys();
}

$query;
export function stableMap5Len(): nat64 {
    return stableMap5.len();
}

$update;
export function stableMap5Remove(key: Opt<String>): Opt<float64> {
    return stableMap5.remove(key);
}

$query;
export function stableMap5Values(): float64[] {
    return stableMap5.values();
}