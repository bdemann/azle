import { mkdirSync, writeFileSync } from 'fs';

import { compileRustCodeWithCandidAndCompilerInfo } from './compile_rust_code_with_candid_and_compiler_info';
import { getCandidAndCanisterMethods } from './get_candid_and_canister_methods';
import { getCanisterJavaScript } from './get_canister_javascript';
import { getNames } from './get_names';
import { handleCli } from './handle_cli';
import { prepareDockerImage } from './prepare_docker_images';
import { prepareRustStagingArea } from './prepare_rust_staging_area';
import { logSuccess, time } from './utils';
import { green } from './utils/colors';
import { GLOBAL_AZLE_CONFIG_DIR } from './utils/global_paths';
import { CompilerInfo } from './utils/types';

azle();

async function azle() {
    const {
        stdioType,
        dockerfileHash,
        dockerContainerPrefix,
        dockerImagePrefix,
        canisterName,
        canisterPath,
        dockerImageName,
        dockerImagePathTar,
        dockerImagePathTarGz,
        dockerContainerName,
        wasmedgeQuickJsPath,
        canisterConfig,
        candidPath,
        compilerInfoPath,
        envVars
    } = getNames();

    const commandExecuted = handleCli(
        stdioType,
        dockerfileHash,
        dockerContainerPrefix,
        dockerImagePrefix
    );

    if (commandExecuted === true) {
        return;
    }

    await time(
        `\nBuilding canister ${green(canisterName)}`,
        'default',
        async () => {
            createAzleDirectories();

            prepareDockerImage(
                stdioType,
                dockerImageName,
                dockerImagePathTar,
                dockerImagePathTarGz,
                dockerContainerName,
                wasmedgeQuickJsPath
            );

            const canisterJavaScript = getCanisterJavaScript(
                canisterConfig,
                wasmedgeQuickJsPath
            );

            prepareRustStagingArea(
                canisterConfig,
                canisterPath,
                canisterJavaScript
            );

            const { candid, canisterMethods } = getCandidAndCanisterMethods(
                canisterConfig.candid_gen,
                canisterPath,
                candidPath,
                compilerInfoPath,
                dockerContainerName,
                canisterName,
                stdioType,
                envVars
            );

            // This is for the dfx.json candid property
            writeFileSync(candidPath, candid);

            const compilerInfo: CompilerInfo = {
                // The spread is because canisterMethods is a function with properties
                canister_methods: {
                    ...canisterMethods
                },
                env_vars: envVars
            };

            compileRustCodeWithCandidAndCompilerInfo(
                canisterPath,
                candid,
                compilerInfoPath,
                compilerInfo,
                dockerContainerName,
                canisterName,
                stdioType
            );
        }
    );

    logSuccess(canisterName);
}

function createAzleDirectories() {
    mkdirSync(GLOBAL_AZLE_CONFIG_DIR, { recursive: true });
    mkdirSync('.azle', { recursive: true });
}
