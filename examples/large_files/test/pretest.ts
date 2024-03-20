import { Unit, generateFileOfSize, toBytes } from 'azle/scripts/file_generator';
import { execSync } from 'child_process';
import { rm } from 'fs/promises';
import { join } from 'path';

async function pretest() {
    await rm(join('assets', 'auto'), { recursive: true, force: true });
    // Edge Cases
    // TODO excluded because it will require some reworking to get 0 byte files to work and it doesn't seem urgent
    // generateFileOfSize(0, 'B');
    await generateTestFileOfSize(1, 'B');
    await generateTestFileOfSize(120 * 1024 * 1024 + 1, 'B'); // One more byte than can be processed in a single hash_file_by_parts call
    await generateTestFileOfSize(2_000_001, 'B'); // One more byte that the high water mark of the readstream

    // General Cases
    // TODO Add tests for huge files after https://github.com/wasm-forge/stable-fs/issues/2 is resolved
    await generateTestFileOfSize(1, 'KiB');
    await generateTestFileOfSize(10, 'KiB');
    await generateTestFileOfSize(100, 'KiB');
    await generateTestFileOfSize(1, 'MiB');
    await generateTestFileOfSize(10, 'MiB');
    await generateTestFileOfSize(100, 'MiB');
    await generateTestFileOfSize(250, 'MiB');
    await generateTestFileOfSize(1, 'GiB');
    await generateTestFileOfSize(150, 'MiB', 'manual');

    execSync(`dfx canister uninstall-code backend || true`, {
        stdio: 'inherit'
    });

    execSync(`dfx deploy`, {
        stdio: 'inherit'
    });
}

pretest();

async function generateTestFileOfSize(
    size: number,
    unit: Unit,
    dir: string = 'auto'
) {
    const autoDir = join('assets', dir);
    const path = join(autoDir, `test${size}${unit}`);
    const fileSize = toBytes(size, unit);
    await generateFileOfSize(path, fileSize);
}
