import { spawn } from 'child_process';
import { CuzzConfig } from 'cuzz';
import { readFile } from 'fs-extra';
import { join } from 'path';

import { DfxJson } from '../src/build/stable/utils/types';

export async function runFuzzTests(): Promise<void> {
    const dfxJson = await getDfxJson();
    const cuzzConfig = await getCuzzConfig();
    const canisterNames = getCanisterNames(dfxJson);
    const callDelay = getCallDelay(cuzzConfig);

    for (const canisterName of canisterNames) {
        fuzzTestCanister(canisterName, callDelay);
    }
}

async function getDfxJson(): Promise<DfxJson> {
    const dfxFile = await readFile(join(process.cwd(), 'dfx.json'), 'utf-8');

    return JSON.parse(dfxFile);
}

async function getCuzzConfig(): Promise<CuzzConfig> {
    try {
        const cuzzFile = await readFile(
            join(process.cwd(), 'cuzz.json'),
            'utf-8'
        );

        return JSON.parse(cuzzFile);
    } catch {
        return {};
    }
}

function getCanisterNames(dfxJson: DfxJson): string[] {
    if (dfxJson.canisters === undefined) {
        throw new Error('No canisters found in dfx.json');
    }

    return Object.keys(dfxJson.canisters);
}

function getCallDelay(cuzzConfig: CuzzConfig): string {
    return (
        process.env.AZLE_FUZZ_CALL_DELAY ??
        cuzzConfig.callDelay?.toString() ??
        '.1'
    );
}

function fuzzTestCanister(canisterName: string, callDelay: string): void {
    const baseCuzzArgs = [
        '--canister-name',
        canisterName,
        '--skip-deploy',
        '--call-delay',
        callDelay
    ];

    const cuzzArgs =
        process.env.AZLE_FUZZ_TERMINAL === 'true'
            ? [...baseCuzzArgs, '--terminal']
            : baseCuzzArgs;

    let cuzzProcess = spawn('node_modules/.bin/cuzz', cuzzArgs, {
        stdio: 'inherit'
    });

    cuzzProcess.on('exit', (code) => {
        if (code !== 0) {
            process.exit(code ?? 1);
        }
    });
}
