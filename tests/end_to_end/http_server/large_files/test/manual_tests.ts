import { describe } from '@jest/globals';
import { expect, it, please, Test } from 'azle/test';
import { execSync } from 'child_process';
import { join } from 'path';

import { Unit } from '../../../../../scripts/file_generator';
import { generateTestFileOfSize } from './generate_test_files';
import { getAutoGeneratedFileName, verifyUpload } from './tests';

export function manualTests(origin: string): Test {
    const manualFileSize =
        process.env.AZLE_IS_FEATURE_BRANCH_PR === 'true' ||
        process.env.AZLE_IS_FEATURE_BRANCH_DRAFT_PR === 'true'
            ? 7
            : 150;
    const autoGenManualUploadFileInfos: [number, Unit][] = [
        [manualFileSize, 'MiB']
    ];

    return () => {
        describe.each(autoGenManualUploadFileInfos)(
            'prepare auto generated files locally for manual upload',
            (size, units) => {
                const fileName = getAutoGeneratedFileName(size, units);
                please(
                    `generate file: ${fileName}`,
                    async () => {
                        await generateTestFileOfSize(size, units, 'manual');
                    },
                    10 * 60 * 1_000
                );
            }
        );

        describe.each(autoGenManualUploadFileInfos)(
            'initial manual upload of auto files',
            (size, units) => {
                const fileName = getAutoGeneratedFileName(size, units);
                it(
                    'manually uploads files via azle command',
                    async () => {
                        execSync(
                            `node_modules/.bin/azle upload-assets backend ${join(
                                'assets',
                                'manual',
                                fileName
                            )} assets/${fileName}`,
                            {
                                stdio: 'inherit'
                            }
                        );

                        const response = await fetch(
                            `${origin}/exists?path=assets/${fileName}`
                        );

                        expect(await response.json()).toBe(true);
                    },
                    10 * 60 * 1_000
                );
            }
        );

        describe.each(autoGenManualUploadFileInfos)(
            'initial manual upload of auto files',
            (size, units) => {
                const fileName = getAutoGeneratedFileName(size, units);
                verifyUpload(origin, join('manual', fileName), fileName);
            }
        );
    };
}
