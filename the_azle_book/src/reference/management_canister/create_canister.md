# create_canister

This section is a work in progress.

Examples:

-   [management_canister](https://github.com/demergent-labs/azle/tree/main/examples/management_canister)

```typescript
import { match, $update, Variant } from 'azle';
import {
    CreateCanisterResult,
    managementCanister
} from 'azle/canisters/management';

$update;
export async function executeCreateCanister(): Promise<
    Variant<{
        Ok: CreateCanisterResult;
        Err: string;
    }>
> {
    const createCanisterResultCanisterResult = await managementCanister
        .create_canister({
            settings: null
        })
        .cycles(50_000_000_000_000n)
        .call();

    return match(createCanisterResultCanisterResult, {
        Ok: (createCanisterResult) => {
            state.createdCanisterId = createCanisterResult.canister_id;

            return {
                Ok: createCanisterResult
            };
        },
        Err: (err) => ({ Err: err })
    });
}
```