import { IOType } from 'child_process';

import { execSyncPretty } from '../../../../stable/utils/exec_sync_pretty';

export function compile(
    manifestPath: string,
    wasmDest: string,
    ioType: IOType
): void {
    execSyncPretty(
        `CARGO_TARGET_DIR=target cargo build --target wasm32-wasi --manifest-path ${manifestPath} --release`,
        ioType
    );

    execSyncPretty(
        `wasi2ic target/wasm32-wasi/release/experimental_canister_template.wasm ${wasmDest}`,
        ioType
    );
}
