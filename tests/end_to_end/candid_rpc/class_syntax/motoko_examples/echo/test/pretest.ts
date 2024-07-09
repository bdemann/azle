import { linkAndInstallPatch } from 'azle/test/jest_link';
import { execSync } from 'child_process';
import { join } from 'path';

function pretest(): void {
    linkAndInstallPatch(join('examples', 'motoko_examples', 'echo'));

    execSync(`dfx canister uninstall-code echo || true`, {
        stdio: 'inherit'
    });

    execSync(`dfx deploy echo`, {
        stdio: 'inherit'
    });

    execSync(`dfx generate echo`, {
        stdio: 'inherit'
    });
}

pretest();