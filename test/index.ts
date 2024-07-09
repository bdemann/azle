// TODO import deepEqual from 'deep-is' works for some
// TODO import { deepEqual } from 'deep-is' works for others
// TODO require seems to work for all of them
// eslint-disable-next-line @typescript-eslint/no-var-requires
const deepEqual = require('deep-is');

import { jsonStringify } from '../src/lib/json';

export type Test<> = {
    name: string;
    skip?: boolean;
    wait?: number;
    prep?: () => Promise<void>;
    test?: () => Promise<AzleResult>;
};

// TODO get rid of this union once the jest migration is complete
type AzleResult =
    | Partial<{
          Ok: { isSuccessful: boolean; message?: string };
          Err: string;
      }>
    | Partial<{ Ok: boolean; Err: string }>;

// TODO should this just return a boolean?
// TODO then the function calling can decide to throw or not
export async function runTests(
    tests: Test[],
    exitProcess: boolean = true
): Promise<boolean> {
    for (const test of tests) {
        try {
            if (test.skip === true) {
                console.info(`Skipping: ${test.name}`);

                continue;
            }

            console.info();

            if (test.prep !== undefined || test.wait !== undefined) {
                console.info(`\n${test.name}\n`);
            } else {
                console.info(`\nRunning test: ${test.name}\n`);
            }

            if (test.wait !== undefined) {
                console.info(`waiting ${test.wait} milliseconds`);
                await new Promise((resolve) => setTimeout(resolve, test.wait));
                console.info('done waiting');
                continue;
            }

            if (test.prep !== undefined) {
                continue;
            }

            const result: AzleResult =
                test.test !== undefined
                    ? await test.test()
                    : {
                          Err: 'test is not defined'
                      };

            if (result.Err !== undefined || result.Ok === undefined) {
                console.info('\x1b[31m', `test: ${test.name} failed`);
                console.info('\x1b[31m', `${result.Err}`);
                console.info('\x1b[0m');

                if (exitProcess) {
                    process.exit(1);
                } else {
                    return false;
                }
            }

            // TODO replace this with the below commented out code once jest migration is complete
            const message =
                typeof result.Ok === 'object' && result.Ok !== null
                    ? result.Ok.message
                    : undefined;
            const successful =
                typeof result.Ok === 'boolean'
                    ? result.Ok
                    : result.Ok.isSuccessful;

            if (successful !== true) {
                console.info('\x1b[31m', `test: ${test.name} failed`);
                if (message !== undefined) {
                    console.info('\x1b[31m', `${message}`);
                }
                console.info('\x1b[0m');

                if (exitProcess) {
                    process.exit(1);
                } else {
                    return false;
                }
            }

            // TODO bring this back once jest migration is complete
            // if (result.Ok.isSuccessful !== true) {
            //     console.info('\x1b[31m', `test: ${test.name} failed`);
            //     if (result.Ok.message !== undefined) {
            //         console.info('\x1b[31m', `${result.Ok.message}`);
            //     }
            //     console.info('\x1b[0m');

            //     if (exitProcess) {
            //         process.exit(1);
            //     } else {
            //         return false;
            //     }
            // }

            console.info('\x1b[32m', `test: ${test.name} passed`);
            console.info('\x1b[0m');
        } catch (error) {
            console.info(
                '\x1b[31m',
                `test ${test.name} failed`,
                (error as any).toString()
            );
            console.info('\x1b[0m');

            if (exitProcess) {
                process.exit(1);
            } else {
                return false;
            }
        }
    }

    return true;
}

// TODO is is better test framework conformity to call this assertEqual? I'll hold off for now, it should be easy to search for all testEquality and change it, easier than assertEqual I think
// TODO so based on this I think I've actually seen this in other testing frameworks, assertEquals will take two and make sure they are equals, and assert will take one boolean. Right now we have test instead of assert but it would be easy to change
export function testEquality<T = any>(actual: T, expected: T): AzleResult {
    if (deepEqual(actual, expected)) {
        return { Ok: { isSuccessful: true } };
    } else {
        const message = `Expected: ${jsonStringify(
            expected
        )}, Received: ${jsonStringify(actual)}`;
        return { Ok: { isSuccessful: false, message } };
    }
}

export function createSnakeCaseProxy<T extends object>(
    target: T,
    async: boolean = true
): T {
    if (
        target === null ||
        (typeof target !== 'object' && typeof target !== 'function') ||
        target?.constructor?.name === 'Principal' ||
        target?.constructor?.name === 'BigInt' ||
        target?.constructor?.name === 'BigInt64Array' ||
        target?.constructor?.name === 'Int32Array' ||
        target?.constructor?.name === 'Int16Array' ||
        target?.constructor?.name === 'Int8Array' ||
        target?.constructor?.name === 'BigUint64Array' ||
        target?.constructor?.name === 'Uint32Array' ||
        target?.constructor?.name === 'Uint16Array' ||
        target?.constructor?.name === 'Uint8Array'
    ) {
        return target;
    }

    return new Proxy(target, {
        get(obj, prop) {
            const snakeCaseProp =
                (prop as string)[0] === (prop as string)[0]?.toUpperCase()
                    ? prop
                    : camelToSnakeCase(prop as string);

            if (typeof (obj as any)[snakeCaseProp] === 'function') {
                if (async) {
                    return async (...args: any[]) => {
                        const new_args = args.map((value) => {
                            return convertKeysToSnakeCase(value);
                        });
                        const result = await (obj as any)[snakeCaseProp](
                            ...new_args
                        );
                        return createSnakeCaseProxy(result, false);
                    };
                } else {
                    return (...args: any[]) => {
                        const new_args = args.map((value) => {
                            return convertKeysToSnakeCase(value);
                        });
                        const result = (obj as any)[snakeCaseProp](...new_args);
                        return createSnakeCaseProxy(result, false);
                    };
                }
            }

            if (typeof (obj as any)[snakeCaseProp] === 'object') {
                return createSnakeCaseProxy((obj as any)[snakeCaseProp], false);
            }

            return (obj as any)[snakeCaseProp];
        }
    }) as any;
}

function convertKeysToSnakeCase(obj: any): any {
    if (
        typeof obj !== 'object' ||
        obj === null ||
        obj?.constructor?.name === 'Principal' ||
        obj?.constructor?.name === 'BigInt' ||
        obj?.constructor?.name === 'BigInt64Array' ||
        obj?.constructor?.name === 'Int32Array' ||
        obj?.constructor?.name === 'Int16Array' ||
        obj?.constructor?.name === 'Int8Array' ||
        obj?.constructor?.name === 'BigUint64Array' ||
        obj?.constructor?.name === 'Uint32Array' ||
        obj?.constructor?.name === 'Uint16Array' ||
        obj?.constructor?.name === 'Uint8Array'
    ) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map((element) => convertKeysToSnakeCase(element));
    }

    const newObj = {};
    for (const key in obj) {
        const snakeCaseKey =
            (key as string)[0] === (key as string)[0]?.toUpperCase()
                ? key
                : camelToSnakeCase(key as string);
        (newObj as any)[snakeCaseKey] = convertKeysToSnakeCase(obj[key]);
    }

    return newObj;
}

function camelToSnakeCase(str: string) {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}
