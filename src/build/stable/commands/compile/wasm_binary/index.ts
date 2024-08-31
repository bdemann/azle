import { IOType } from 'child_process';
import { existsSync } from 'fs';

import { STABLE_STATIC_CANISTER_TEMPLATE_PATH } from '../../../utils/global_paths';
import { logGlobalDependencies } from '../../../utils/log_global_dependencies';
import { MethodMeta, WasmData } from '../../../utils/types';
import { compile } from './compile';
import { manipulateWasmBinary } from './manipulate';
import { prepareRustStagingArea } from './prepare_rust_staging_area';

export async function getWasmBinary(
    canisterName: string,
    stdio: IOType,
    js: string,
    wasmData: WasmData,
    canisterPath: string,
    methodMeta?: MethodMeta
): Promise<Uint8Array> {
    if (
        process.env.AZLE_GEN_WASM === 'true' ||
        !existsSync(STABLE_STATIC_CANISTER_TEMPLATE_PATH)
    ) {
        await logGlobalDependencies();

        await prepareRustStagingArea(canisterPath);

        compile(STABLE_STATIC_CANISTER_TEMPLATE_PATH, canisterName, stdio);
    }

    return await manipulateWasmBinary<WasmData>(
        js,
        STABLE_STATIC_CANISTER_TEMPLATE_PATH,
        wasmData,
        methodMeta
    );
}