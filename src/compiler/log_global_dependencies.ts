import { writeFile } from 'fs/promises';
import { join } from 'path';

import { execSyncPretty } from './utils/exec_sync_pretty';
import { AZLE_PACKAGE_PATH } from './utils/global_paths';

export async function logGlobalDependencies(): Promise<void> {
    const wasiVersion = execSyncPretty('cargo install --list | grep wasi2ic');
    const nodeVersion = execSyncPretty('node --version');
    const rustVersion = execSyncPretty('rustc --version');

    const globalDependencies = `wasi2ic version: ${wasiVersion}
node version: ${nodeVersion}
rustc version: ${rustVersion}`;

    await writeFile(
        join(AZLE_PACKAGE_PATH, 'global_dependencies'),
        globalDependencies
    );
}
