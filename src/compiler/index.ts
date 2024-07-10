import { IOType } from 'child_process';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

import { compileRustCodeWithCandidAndCompilerInfo } from './compile_rust_code_with_candid_and_compiler_info';
import { setupFileWatcher } from './file_watcher/setup_file_watcher';
import { getCandidAndCanisterMethods } from './get_candid_and_canister_methods';
import { getCanisterJavaScript } from './get_canister_javascript';
import { getNamesAfterCli, getNamesBeforeCli } from './get_names';
import { handleCli } from './handle_cli';
import { prepareRustStagingArea } from './prepare_rust_staging_area';
import { getStdIoType, logSuccess, time, unwrap } from './utils';
import { green } from './utils/colors';
import { execSyncPretty } from './utils/exec_sync_pretty';
import {
    AZLE_PACKAGE_PATH,
    GLOBAL_AZLE_CONFIG_DIR
} from './utils/global_paths';
import { CompilerInfo } from './utils/types';

azle();

async function azle(): Promise<void> {
    // We must run this before getNamesBeforeCli because
    // any dfx commands require the azle extension to be installed
    if (process.argv[2] === 'install-dfx-extension') {
        installDfxExtension(getStdIoType());

        return;
    }

    const {
        stdioType,
        wasmedgeQuickJsPath,
        replicaWebServerPort,
        nativeCompilation
    } = await getNamesBeforeCli();

    const commandExecuted = await handleCli();

    if (commandExecuted === true) {
        return;
    }

    const {
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
    } = await getNamesAfterCli();

    await time(
        `\nBuilding canister ${green(canisterName)}`,
        'default',
        async () => {
            createAzleDirectories();

            const canisterJavaScript = unwrap(
                await getCanisterJavaScript(
                    canisterConfig.main,
                    wasmedgeQuickJsPath,
                    esmAliases,
                    esmExternals
                )
            );

            await prepareRustStagingArea(
                canisterConfig,
                canisterPath,
                canisterJavaScript,
                stdioType
            );

            const { candid, canisterMethods } =
                await getCandidAndCanisterMethods(
                    canisterConfig.candid_gen,
                    candidPath,
                    compilerInfoPath,
                    canisterName,
                    stdioType,
                    envVars,
                    rustStagingCandidPath,
                    rustStagingWasmPath,
                    nativeCompilation,
                    canisterJavaScript
                );

            setupFileWatcher(
                reloadedJsPath,
                canisterId,
                canisterConfig.main,
                wasmedgeQuickJsPath,
                esmAliases,
                esmExternals,
                canisterName,
                canisterMethods.post_upgrade?.index ?? -1
            );

            // This is for the dfx.json candid property
            await writeFile(candidPath, candid);

            const compilerInfo: CompilerInfo = {
                // The spread is because canisterMethods is a function with properties
                canister_methods: {
                    ...canisterMethods
                },
                env_vars: envVars
            };

            await compileRustCodeWithCandidAndCompilerInfo(
                rustStagingCandidPath,
                candid,
                compilerInfoPath,
                compilerInfo,
                canisterName,
                stdioType,
                nativeCompilation,
                canisterJavaScript
            );
        }
    );

    logSuccess(canisterName, canisterId, replicaWebServerPort);
}

async function createAzleDirectories(): Promise<void> {
    await Promise.all([
        mkdir(GLOBAL_AZLE_CONFIG_DIR, { recursive: true }),
        mkdir('.azle', { recursive: true })
    ]);
}

// TODO this is just temporary
// TODO until we either make azle an official extension in the DFINITY dfx extensions repo
// TODO or we have a better way for the developer to install the extension locally
function installDfxExtension(stdioType: IOType): void {
    const dfxExtensionDirectoryPath = join(AZLE_PACKAGE_PATH, 'dfx_extension');
    execSyncPretty(
        `cd ${dfxExtensionDirectoryPath} && ./install.sh`,
        stdioType
    );
}
