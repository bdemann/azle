// TODO make this function's return type explicit https://github.com/demergent-labs/azle/issues/1860
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { join } from 'path';

import { getCanisterId } from '../../dfx';
import { version } from '../../package.json';
import {
    getCanisterConfig,
    getCanisterName,
    getStdIoType,
    unwrap
} from './utils';
import { execSyncPretty } from './utils/exec_sync_pretty';
import { GLOBAL_AZLE_CONFIG_DIR } from './utils/global_paths';
import { CanisterConfig } from './utils/types';

export async function getNamesBeforeCli() {
    const stdioType = getStdIoType();

    const wasmedgeQuickJsName = `wasmedge-quickjs_${version}`;

    const wasmedgeQuickJsPath = join(
        GLOBAL_AZLE_CONFIG_DIR,
        wasmedgeQuickJsName
    );

    const replicaWebServerPort = execSyncPretty(`dfx info webserver-port`)
        .toString()
        .trim();

    const nativeCompilation = process.argv.includes('--native-compilation');

    return {
        stdioType,
        wasmedgeQuickJsName,
        wasmedgeQuickJsPath,
        replicaWebServerPort,
        nativeCompilation
    };
}

export function getNamesAfterCli() {
    const canisterName = unwrap(getCanisterName(process.argv));
    const canisterPath = join('.azle', canisterName);

    const canisterConfig = unwrap(getCanisterConfig(canisterName));
    const candidPath = process.env.CANISTER_CANDID_PATH;

    if (candidPath === undefined) {
        throw new Error(`Azle: CANISTER_CANDID_PATH is not defined`);
    }

    const compilerInfoPath = join(
        canisterPath,
        'canister',
        'src',
        'compiler_info.json'
    );

    const envVars = getEnvVars(canisterConfig);

    const rustStagingCandidPath = join(
        canisterPath,
        'canister',
        'src',
        'candid.did'
    );

    const rustStagingWasmPath = join(canisterPath, `${canisterName}.wasm`);

    const canisterId = getCanisterId(canisterName);

    const reloadedJsPath = join(
        '.azle',
        canisterName,
        'canister',
        'src',
        'main_reloaded.js'
    );

    const esmAliases = canisterConfig.esm_aliases ?? {};
    const esmExternals = canisterConfig.esm_externals ?? [];

    return {
        canisterName,
        canisterPath,
        canisterConfig,
        candidPath,
        compilerInfoPath,
        envVars,
        rustStagingCandidPath,
        rustStagingWasmPath,
        canisterId,
        reloadedJsPath,
        esmAliases,
        esmExternals
    };
}

function getEnvVars(canisterConfig: CanisterConfig): [string, string][] {
    const env = [...(canisterConfig.env ?? []), 'AZLE_AUTORELOAD'];

    return env
        .filter((envVarName) => process.env[envVarName] !== undefined)
        .map((envVarName) => {
            const envVarValue = process.env[envVarName];

            if (envVarValue === undefined) {
                throw new Error(
                    `Environment variable ${envVarName} must be undefined`
                );
            }

            return [envVarName, envVarValue];
        });
}
