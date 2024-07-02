import { linkAndInstallPatch } from 'azle/test/jest_link';
import { execSync } from 'child_process';
import { join } from 'path';

function pretest(): void {
    linkAndInstallPatch(join('examples', 'vanilla_js'));

    execSync(`dfx canister uninstall-code vanilla_js || true`, {
        stdio: 'inherit'
    });

    execSync(`dfx deploy vanilla_js`, {
        stdio: 'inherit'
    });

    execSync(`dfx generate vanilla_js`, {
        stdio: 'inherit'
    });
}

pretest();
