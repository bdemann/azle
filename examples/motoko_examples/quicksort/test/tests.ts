import { Ok, Test } from 'azle/test';
import { int } from 'azle';
import { _SERVICE } from '../dfx_generated/azle/azle.did';
import { ActorSubclass } from '@dfinity/agent';

export function get_tests(quicksort_canister: ActorSubclass<_SERVICE>): Test[] {
    return [
        {
            name: 'sort - with values from the motoko repo',
            test: async () => {
                const input = [5n, 3n, 0n, 9n, 8n, 2n, 1n, 4n, 7n, 6n];
                const expectedValues = [0n, 1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n];

                return await arrayIsSorted(
                    quicksort_canister,
                    input,
                    expectedValues
                );
            }
        },
        {
            name: 'sort - with an empty array',
            test: async () => {
                const input: int[] = [];
                const expectedValues: int[] = [];

                return await arrayIsSorted(
                    quicksort_canister,
                    input,
                    expectedValues
                );
            }
        },
        {
            name: 'sort - with only one int',
            test: async () => {
                const input = [1n];
                const expectedValues = [1n];

                return await arrayIsSorted(
                    quicksort_canister,
                    input,
                    expectedValues
                );
            }
        },
        {
            name: 'sort - with negative numbers',
            test: async () => {
                const input = [1n, -3n, -1n, 0n, -2n, 2n, 3n];
                const expectedValues = [-3n, -2n, -1n, 0n, 1n, 2n, 3n];

                return await arrayIsSorted(
                    quicksort_canister,
                    input,
                    expectedValues
                );
            }
        }
    ];
}

async function arrayIsSorted(
    quicksort_canister: ActorSubclass<_SERVICE>,
    input: int[],
    expectedValues: int[]
): Promise<Ok<boolean>> {
    const result = await quicksort_canister.sort(input);
    const elementIsOrderedCorrectly = (element: int, index: number) => {
        return element === expectedValues[index];
    };

    return {
        ok: result.every(elementIsOrderedCorrectly)
    };
}