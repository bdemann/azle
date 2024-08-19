import { describe } from '@jest/globals';
import { please, Test } from 'azle/test';
import { execSync } from 'child_process';
import { join } from 'path';

import { Unit } from '../../../../../scripts/file_generator';
import { generateTestFileOfSize } from './generate_test_files';
import { getAutoGeneratedFileName, verifyUpload } from './tests';

const hugeAutoGenAutoUploadSmallFileInfos: [number, Unit][] = [[0, 'GiB']]; // The tests will fail if this array is empty, so for !AZLE_TEST_RUN_ON_RELEASE && !AZLE_TEST_RUN_ON_LOCAL we will have a dummy entry

const hugeAutoGenAutoUploadFileInfos: [number, Unit][] =
    process.env.AZLE_TEST_RUN_ON_RELEASE === 'true' ||
    process.env.AZLE_TEST_RUN_ON_LOCAL === 'true'
        ? [...hugeAutoGenAutoUploadSmallFileInfos, [2, 'GiB'], [5, 'GiB']]
        : hugeAutoGenAutoUploadSmallFileInfos;

export function hugeFilesTests(origin: string): Test {
    return () => {
        describe.each(hugeAutoGenAutoUploadFileInfos)(
            'generate huge files',
            (size, units) => {
                const fileName = getAutoGeneratedFileName(size, units);
                please(
                    `generate huge file: ${fileName}`,
                    async () => {
                        await generateTestFileOfSize(size, units);
                    },
                    // TODO fix these numbers when we know them better
                    (10 + 20 + 40) * 60 * 1_000
                );
            }
        );

        please(
            'redeploy the canister to reupload',
            async () => {
                execSync(`dfx deploy --upgrade-unchanged`, {
                    stdio: 'inherit'
                });
            },
            (40 + 40) * 60 * 1_000
            // TODO fix these numbers when we know them better
        );

        describe.each(hugeAutoGenAutoUploadFileInfos)(
            'verify huge files were uploaded correctly',
            (size, units) => {
                const fileName = getAutoGeneratedFileName(size, units);
                verifyUpload(origin, join('auto', fileName), fileName, 500_000);
            }
        );
    };
}
