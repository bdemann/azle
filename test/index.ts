import * as dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

import { ActorSubclass } from '@dfinity/agent';
import { describe, expect, test } from '@jest/globals';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

import { getCanisterId } from '../dfx';
// @ts-ignore We would have to add "resolveJsonModule": true to every test tsconfig.json file
import { version } from '../package.json';
import { execSyncPretty } from '../src/build/stable/utils/exec_sync_pretty';
export { expect } from '@jest/globals';

export type Test = () => void;

type Benchmark = {
    0: string;
    1: {
        '1_832_883_877': string;
        '2_374_371_241': string;
    };
};

export function runTests(tests: Test, cwd: string = process.cwd()): void {
    const { shouldRunTests, shouldRunTypeChecks, shouldRunBenchmarks } =
        processEnvVars();

    if (shouldRunTests) {
        describe(`tests`, tests);
    }

    if (shouldRunTypeChecks) {
        describe(`type checks`, () => {
            it('checks types', () => {
                try {
                    execSyncPretty(
                        `${join(
                            cwd,
                            'node_modules',
                            '.bin',
                            'tsc'
                        )} --noEmit --skipLibCheck --target es2020 --strict --moduleResolution node --allowJs`,
                        'inherit'
                    );
                } catch {
                    expect('Type checking failed').toBe(
                        'Type checking to pass'
                    );
                }
            });
        });
    }

    if (shouldRunBenchmarks) {
        describe(`benchmarks`, () => {
            it('runs benchmarks', async () => {
                const canisterId = getCanisterId('async_await');
                const result = execSyncPretty(
                    `dfx canister call ${canisterId} _azle_get_benchmarks --output json`,
                    'pipe'
                );
                const currentBenchmarks: Benchmark[] = JSON.parse(
                    result.toString()
                );

                const benchmarksJson = await getBenchmarksJson();
                const previousBenchmarks = benchmarksJson.previous.benchmarks;

                const currentBenchmarksTable = createBenchmarksTable(
                    currentBenchmarks,
                    previousBenchmarks
                );

                const previousBenchmarksTable = createBenchmarksTable(
                    previousBenchmarks,
                    []
                );

                await writeFile(
                    `benchmarks.md`,
                    `## Current benchmarks Azle version: ${version}\n${currentBenchmarksTable}\n\n## Baseline benchmarks Azle version: ${benchmarksJson.previous.version}\n${previousBenchmarksTable}`
                );

                const updatedBenchmarksJson: BenchmarksJson = {
                    current: {
                        version,
                        benchmarks: currentBenchmarks
                    },
                    previous: {
                        version: benchmarksJson.previous.version,
                        benchmarks:
                            benchmarksJson.previous.benchmarks.length === 0 &&
                            benchmarksJson.previous.version === version
                                ? currentBenchmarks
                                : benchmarksJson.previous.benchmarks
                    }
                };

                await writeFile(
                    'benchmarks.json',
                    JSON.stringify(updatedBenchmarksJson, null, 4)
                );

                console.log(currentBenchmarks);
            });
        });
    }
}

export function wait(name: string, delay: number): void {
    test(
        `wait ${name}`,
        async () => {
            console.info(`Waiting: ${delay} milliseconds ${name}`);
            await new Promise((resolve) => {
                setTimeout(resolve, delay);
            });
        },
        delay + 1_000
    );
}

export function please(
    name: string,
    fn: () => void | Promise<void>,
    timeout?: number
): void {
    test(
        `please ${name}`,
        async () => {
            console.info(`Preparing: ${name}`);
            await fn();
        },
        timeout
    );
}
please.skip = test.skip;
please.only = test.only;

export function it(
    name: string,
    fn: () => void | Promise<void>,
    timeout?: number
): void {
    test(
        `it ${name}`,
        async () => {
            console.info(`Testing: ${name}`);
            await fn();
        },
        timeout
    );
}
it.only = test.only;
it.skip = test.skip;

function processEnvVars(): {
    shouldRunTests: boolean;
    shouldRunTypeChecks: boolean;
    shouldRunBenchmarks: boolean;
} {
    const isTestsEnvVarSet =
        process.env.AZLE_INTEGRATION_TEST_RUN_TESTS === 'true';
    const isTypeChecksEnvVarSet =
        process.env.AZLE_INTEGRATION_TEST_RUN_TYPE_CHECKS === 'true';
    const isBenchmarksEnvVarSet =
        process.env.AZLE_INTEGRATION_TEST_RUN_BENCHMARKS === 'true';

    const areNoVarsSet =
        !isTestsEnvVarSet && !isTypeChecksEnvVarSet && !isBenchmarksEnvVarSet;

    const shouldRunTests = isTestsEnvVarSet || areNoVarsSet;
    const shouldRunTypeChecks = isTypeChecksEnvVarSet || areNoVarsSet;
    const shouldRunBenchmarks = isBenchmarksEnvVarSet || areNoVarsSet;

    return {
        shouldRunTests,
        shouldRunTypeChecks,
        shouldRunBenchmarks
    };
}

export const defaultPropTestParams = {
    numRuns: Number(process.env.AZLE_PROPTEST_NUM_RUNS ?? 1),
    endOnFailure: process.env.AZLE_PROPTEST_SHRINK === 'true' ? false : true
};

export async function getCanisterActor<T>(
    canisterName: string
): Promise<ActorSubclass<T>> {
    const { createActor } = await import(
        join(process.cwd(), 'test', 'dfx_generated', canisterName)
    );
    const actor = createActor(getCanisterId(canisterName), {
        agentOptions: {
            host: 'http://127.0.0.1:8000'
        }
    });

    return actor;
}

type BenchmarksJson = {
    current: {
        version: string;
        benchmarks: Benchmark[];
    };
    previous: {
        version: string;
        benchmarks: Benchmark[];
    };
};

import { existsSync } from 'fs';

async function getBenchmarksJson(): Promise<BenchmarksJson> {
    const filePath = 'benchmarks.json';

    if (!existsSync(filePath)) {
        return {
            current: {
                version,
                benchmarks: []
            },
            previous: {
                version,
                benchmarks: []
            }
        };
    }

    return JSON.parse(await readFile(filePath, 'utf-8'));
}

function createBenchmarksTable(
    benchmarks: Benchmark[],
    previousBenchmarks: Benchmark[]
): string {
    if (benchmarks.length === 0) {
        return '';
    }

    const hasChanges = previousBenchmarks.length > 0;

    const tableHeader = hasChanges
        ? '| Execution | Method Name | Instructions | Change |\n|-----------|-------------|------------|-------|\n'
        : '| Execution | Method Name | Instructions |\n|-----------|-------------|------------|\n';

    const calculateChange = (current: string, previous: string): string => {
        const diff = parseInt(current) - parseInt(previous);
        const color = diff < 0 ? 'green' : 'red';
        return `<font color="${color}">${diff > 0 ? '+' : ''}${diff}</font>`;
    };

    const tableRows = benchmarks
        .map((benchmark: Benchmark, index: number) => {
            const executionNumber = index;
            const methodName = benchmark[1]['2_374_371_241'];
            const instructions = benchmark[1]['1_832_883_877'];
            const previousBenchmark = previousBenchmarks[index];

            const baseRow = `| ${executionNumber} | ${methodName} | ${instructions.replace(
                /\B(?=(\d{3})+(?!\d))/g,
                '_'
            )}`;

            if (!hasChanges) {
                return `${baseRow} |`;
            }

            const change = previousBenchmark
                ? calculateChange(
                      instructions,
                      previousBenchmark[1]['1_832_883_877']
                  ).replace(/\B(?=(\d{3})+(?!\d))/g, '_')
                : '';

            return `${baseRow} | ${change} |`;
        })
        .join('\n');

    return tableHeader + tableRows;
}
