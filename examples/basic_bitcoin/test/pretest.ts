import { execSync } from 'child_process';

async function pretest() {
    execSync(`dfx canister uninstall-code backend || true`, {
        stdio: 'inherit'
    });

    execSync(`npm run deploy`, {
        stdio: 'inherit'
    });
}

pretest();
