<div align="center">
    <a href="https://github.com/demergent-labs/azle" target="_blank" rel="noopener noreferrer">
        <img height="150" src="https://raw.githubusercontent.com/demergent-labs/azle/main/logo/logo.svg" alt="Azle logo">
    </a>
</div>
</br>
<div align="center">
    <a href="https://github.com/demergent-labs/azle/actions/workflows/test.yml?query=branch%3Amain">
        <img src="https://github.com/demergent-labs/azle/actions/workflows/test.yml/badge.svg" alt="Coverage Status">
    </a>
    <a href="https://npmcharts.com/compare/azle?minimal=true"><img src="https://img.shields.io/npm/dm/azle.svg" alt="Downloads"></a>
    <a href="https://www.npmjs.com/package/azle"><img src="https://img.shields.io/npm/v/azle.svg" alt="Version"></a>
    <a href="https://github.com/demergent-labs/azle/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/azle.svg" alt="License"></a>
</div>

# Azle (Beta)

TypeScript CDK for the [Internet Computer](https://internetcomputer.org/).

## Disclaimer

Things to keep in mind:

-   Azle does not yet have many live, successful, continuously operating applications deployed to the IC
-   Azle does not yet have extensive automated property tests
-   Azle does not yet have multiple independent security reviews/audits
-   Azle heavily relies on Boa which is [self-proclaimed to be experimental](https://github.com/boa-dev/boa#boa)

## Discussion

Feel free to open issues or join us in the [Discord channel](https://discord.gg/5Hb6rM2QUM).

## Documentation

See [The Azle Book](https://demergent-labs.github.io/azle/).

## Quick Start

```bash
npx azle new hello_world
cd hello_world

npm install
npm run dfx_install
npm run replica_start
npm run canister_deploy_local

npm run canister_call_set_message '("Hello world!")'
npm run canister_call_get_message
```

## Roadmap

The following are the major blockers to 1.0:

-   Extensive automated property testing (~Q1 2023)
-   Performance improvements if necessary (~Q2 2023)
-   Boa production-ready, JS Engine swapout, or risks accepted (~Q2 2023)
-   Multiple independent security reviews/audits (~Q2 2023)

## Contributing

All contributors must agree to and sign the [Azle License Extension](/LICENSE_EXTENSION.md).

Please reach out before working on anything that is not in the [good first issues](https://github.com/demergent-labs/azle/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22) or [help wanted issues](https://github.com/demergent-labs/azle/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted%22). Before beginning work on a contribution, please create or comment on the issue you want to work on and wait for clearance from Demergent Labs.

See [Demergent Labs' Coding Guidelines](/contributing/coding-guidelines.md) for what to expect during code reviews.

## License

Azle's copyright is governed by the [LICENSE](/LICENSE) and [LICENSE_EXTENSION](/LICENSE_EXTENSION.md).
