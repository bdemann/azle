import { afterAll, beforeAll, describe } from '@jest/globals';
import { getCanisterId } from 'azle/dfx';
import { hashFile } from 'azle/scripts/hash_file';
import { createActor } from 'azle/src/build/experimental/commands/upload_assets/file_uploader/uploader_actor';
import { expect, it, please, Test } from 'azle/test';
import { execSync } from 'child_process';
import { readdir, rm } from 'fs/promises';
import { join } from 'path';

import { Unit } from '../../../../../scripts/file_generator';
import { AZLE_UPLOADER_IDENTITY_NAME } from '../../../../../src/build/experimental/commands/upload_assets/uploader_identity';
import { getAuthorizationTests } from './authorization_tests';
import { generateFiles, getDfxConfigFileTests } from './auto_tests';
import { generateTestFileOfSize } from './generate_test_files';
import { hugeFilesTests } from './huge_file_tests';
import { manualTests } from './manual_tests';

export function getTests(canisterId: string): Test {
    const origin = `http://${canisterId}.localhost:8000`;
    const describeLongTest =
        process.env.AZLE_IS_FEATURE_BRANCH_PR === 'true' ||
        process.env.AZLE_IS_FEATURE_BRANCH_DRAFT_PR === 'true'
            ? describe.skip
            : describe;

    return () => {
        beforeAll(async () => {
            // Ensure all files from previous runs are cleared out
            await deleteAutoGeneratedFiles();
        });
        afterAll(async () => {
            // Clear out files from this run
            await deleteAutoGeneratedFiles();
        });

        describe('generate files', generateFiles());

        // Now that the files are generated locally, deploy the canister (which will upload the files to the canister)
        // This initial deploy is here instead of in pretest so that we can time how long the deploy takes
        please('deploy the canister', () => {
            execSync(`dfx deploy`, {
                stdio: 'inherit'
            });
        });

        describe('authorization tests', getAuthorizationTests());

        describe(
            'verify files specified in dfx.json exist after initial deploy',
            getDfxConfigFileTests(origin)
        );

        describeLongTest('redeploy while only uploading modified files', () => {
            please('modify files and redeploy', async () => {
                await generateTestFileOfSize(1, 'KiB');
                await generateTestFileOfSize(10, 'KiB');
                await generateTestFileOfSize(100, 'KiB');
                execSync(`dfx deploy --upgrade-unchanged`, {
                    stdio: 'inherit'
                });
            });

            describe(
                'verify files specified in dfx.json exist after redeploy',
                getDfxConfigFileTests(origin)
            );
        });

        describe('redeploy with no upload', () => {
            please('redeploy with no upload', async () => {
                execSync(
                    `AZLE_DISABLE_AUTO_FILE_UPLOAD=true dfx deploy --upgrade-unchanged`,
                    {
                        stdio: 'inherit'
                    }
                );
            });

            describe(
                'verify files specified in dfx.json exist after redeploy even with file uploading disabled',
                getDfxConfigFileTests(origin)
            );
        });

        describeLongTest('manual upload tests', manualTests(origin));

        // Run the huge file tests only once at the end so they don't slow down the rest of the test process
        // TODO CI CD isn't working with the 2GiB or bigger tests so we're just going to have this one for local tests.
        describeLongTest('huge files tests', hugeFilesTests(origin));
    };
}

export function getAutoGeneratedFileName(size: number, units: Unit): string {
    return `test${size}${units}`;
}

/**
 * Generate a test for file uploading. Hashes the local file and compares it to
 * the hash of the uploaded file. Assumes that all of the files both on the
 * canister and local side are in a directory called "assets".
 *
 * @param origin
 * @param canisterPath
 * @param localDir
 * @param localPath
 * @returns
 */
export function verifyUpload(
    origin: string,
    srcPath: string,
    destPath: string,
    timeout?: number
): void {
    it(
        `uploads and hashes ${srcPath}`,
        async () => {
            const localPath = join('assets', srcPath);
            const canisterPath = join('assets', destPath);

            const expectedHash = (await hashFile(localPath)).toString('hex');

            const response = await fetch(
                `${origin}/exists?path=${canisterPath}`
            );
            const exists = await response.json();

            expect(exists).toBe(true);

            const actor = await createActor(
                getCanisterId('backend'),
                AZLE_UPLOADER_IDENTITY_NAME
            );
            const hash = await actor._azle_get_file_hash(canisterPath);

            expect(hash).toStrictEqual([expectedHash]);
        },
        timeout
    );
}

async function deleteAutoGeneratedFiles(): Promise<void> {
    const autoDir = join('assets', 'auto');
    const files = await readdir(autoDir);
    // Since "assets/auto" is in the dfx.json we don't want to delete the folder itself or else the canister will fail to build
    for (const item of files) {
        await rm(join(autoDir, item), { recursive: true, force: true });
    }
    await rm(join('assets', 'manual'), {
        recursive: true,
        force: true
    });
}
