import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

import {
    getCanisterConfig,
    getCanisterName,
    getStdIoType,
    unwrap
} from './utils';
import { GLOBAL_AZLE_CONFIG_DIR } from './utils/global_paths';
import { JSCanisterConfig } from './utils/types';

export function getNames() {
    const stdioType = getStdIoType();

    const dockerfileHash = getDockerfileHash();
    const dockerImagePrefix = 'azle__image__';
    const dockerImageName = `${dockerImagePrefix}${dockerfileHash}`;
    const dockerContainerPrefix = 'azle__container__';
    const dockerContainerName = `${dockerContainerPrefix}${dockerfileHash}`;
    const wasmedgeQuickJsName = `wasmedge_quickjs_${dockerfileHash}`;

    const dockerImagePathTar = join(
        GLOBAL_AZLE_CONFIG_DIR,
        `${dockerImageName}.tar`
    );
    const dockerImagePathTarGz = join(
        GLOBAL_AZLE_CONFIG_DIR,
        `${dockerImageName}.tar.gz`
    );
    const wasmedgeQuickJsPath = join(
        GLOBAL_AZLE_CONFIG_DIR,
        wasmedgeQuickJsName
    );

    const canisterName = unwrap(getCanisterName(process.argv));
    const canisterPath = join('.azle', canisterName);

    const canisterConfig = unwrap(getCanisterConfig(canisterName));
    const candidPath = canisterConfig.candid;

    const compilerInfoPath = join(
        canisterPath,
        'canister',
        'src',
        'compiler_info.json'
    );

    const envVars = getEnvVars(canisterConfig);

    return {
        stdioType,
        dockerfileHash,
        dockerImagePrefix,
        dockerImageName,
        dockerContainerPrefix,
        dockerContainerName,
        wasmedgeQuickJsName,
        dockerImagePathTar,
        dockerImagePathTarGz,
        wasmedgeQuickJsPath,
        canisterName,
        canisterPath,
        canisterConfig,
        candidPath,
        compilerInfoPath,
        envVars
    };
}

function getDockerfileHash(): string {
    let hash = createHash('sha256');

    const dockerfile = readFileSync(join(__dirname, 'Dockerfile'));

    hash.update(dockerfile);

    return hash.digest('hex');
}

function getEnvVars(canisterConfig: JSCanisterConfig): [string, string][] {
    return (canisterConfig.env ?? []).map((envVarName) => {
        return [envVarName, process.env[envVarName] ?? ''];
    });
}
