import { IOType } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

import { compileRustCodeWithCandidAndCompilerInfo } from './compile_rust_code_with_candid_and_compiler_info';
import { generateCandidAndCanisterMethods } from './generate_candid_and_canister_methods';
import { AZLE_PACKAGE_PATH } from './utils/global_paths';
import { CandidGen, CanisterMethods, CompilerInfo } from './utils/types';

export function getCandidAndCanisterMethods(
    candidGen: CandidGen = 'http',
    candidPath: string,
    compilerInfoPath: string,
    canisterName: string,
    stdioType: IOType,
    envVars: [string, string][],
    rustStagingCandidPath: string,
    rustStagingWasmPath: string,
    nativeCompilation: boolean,
    js: string
): {
    candid: string;
    canisterMethods: CanisterMethods;
} {
    if (candidGen === 'automatic' || candidGen === 'custom') {
        const customCandid =
            candidGen === 'custom' ? readFileSync(candidPath).toString() : '';

        const compilerInfo: CompilerInfo = {
            canister_methods: {
                candid: customCandid,
                queries: [],
                updates: [],
                callbacks: {}
            },
            env_vars: envVars
        };

        compileRustCodeWithCandidAndCompilerInfo(
            rustStagingCandidPath,
            customCandid,
            compilerInfoPath,
            compilerInfo,
            canisterName,
            stdioType,
            nativeCompilation,
            js
        );

        const { candid, canisterMethods } =
            generateCandidAndCanisterMethods(rustStagingWasmPath);

        return {
            candid: candidGen === 'custom' ? customCandid : candid,
            canisterMethods
        };
    }

    if (candidGen === 'http') {
        const candid = readFileSync(
            join(AZLE_PACKAGE_PATH, 'server.did')
        ).toString();

        const canisterMethods: CanisterMethods = {
            candid,
            queries: [
                {
                    name: 'http_request',
                    index: 0,
                    composite: true
                }
            ],
            updates: [
                {
                    name: 'http_request_update',
                    index: 1
                }
            ],
            init: { name: 'init', index: 2 },
            post_upgrade: { name: 'postUpgrade', index: 3 },
            callbacks: {}
        };

        return {
            candid,
            canisterMethods
        };
    }

    throw new Error(`Unsupported candid_gen: ${candidGen}`);
}
