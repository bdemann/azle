import { execSync } from 'child_process';

function pretest(): void {
    // TODO remove basic_bitcoin install and link after https://github.com/demergent-labs/azle/issues/1807 is resolved
    execSync(`cd ../basic_bitcoin && npm install`);

    if (process.env.AZLE_END_TO_END_TEST_LINK_AZLE !== 'false') {
        console.log(
            '---------------------------------------------------------'
        );
        console.log("We're linking!!!");
        console.log(
            '---------------------------------------------------------'
        );
        execSync(`cd ../basic_bitcoin && npm link azle`);
    }

    execSync(`dfx canister uninstall-code bitcoin_psbt || true`, {
        stdio: 'inherit'
    });

    execSync(`BITCOIN_NETWORK=regtest dfx deploy`, {
        stdio: 'inherit'
    });
}

pretest();
