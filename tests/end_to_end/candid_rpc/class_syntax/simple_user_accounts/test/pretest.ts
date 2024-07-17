import { linkAndInstallPatch } from 'azle/test/jest_link';
import { execSync } from 'child_process';
import { join } from 'path';

function pretest(): void {
    linkAndInstallPatch(
        join(
            'tests',
            'end_to_end',
            'candid_rpc',
            'functional_syntax',
            'simple_user_accounts'
        )
    );

    execSync(`dfx canister uninstall-code simple_user_accounts || true`, {
        stdio: 'inherit'
    });

    execSync(`dfx deploy simple_user_accounts`, {
        stdio: 'inherit'
    });

    execSync(`dfx generate simple_user_accounts`, {
        stdio: 'inherit'
    });
}

pretest();
