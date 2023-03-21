# opt

This section is a work in progress.

The Azle type `Opt` corresponds to the [Candid type opt](https://internetcomputer.org/docs/current/references/candid-ref#type-opt-t) and will become the enclosed JavaScript type or null at runtime.

TypeScript:

```typescript
import { Opt, $query } from 'azle';

$query;
export function getOptSome(): Opt<boolean> {
    return true;
}

$query;
export function getOptNone(): Opt<boolean> {
    return null;
}
```

Candid:

```
service : () -> {
    getOptNone : () -> (opt bool) query;
    getOptSome : () -> (opt bool) query;
}
```

dfx:

```bash
dfx canister call candid_canister getOptSome
(opt true)

dfx canister call candid_canister getOptNone
(null)
```