import { Toml } from '../../../types';

export function generateWorkspaceCargoToml(rootPath: string): Toml {
    return `
        # This code is automatically generated by Azle

        [workspace]
        members = [
            "${rootPath}"
        ]

        [profile.release]
        lto = true
        opt-level = 'z'
    `;
}

export function generateLibCargoToml(canisterName: string): Toml {
    return `
        # This code is automatically generated by Azle

        [package]
        name = "${canisterName}"
        version = "0.0.0"
        edition = "2018"

        [lib]
        crate-type = ["cdylib"]

        [dependencies]
        ic-cdk = "0.5.0"
        ic-cdk-macros = "0.5.0"
        candid = "0.7.14"
        # boa_engine = { git = "https://github.com/demergent-labs/boa", branch = "js-bigint-128" }
        boa_engine = { git = "https://github.com/demergent-labs/boa", branch = "vec_u8_into_array_buffer_hack" }
        # boa_engine = { git = "https://github.com/boa-dev/boa", rev = "f3db18fc5468576d2c6df31b259890c1d43d3607" }
        # boa_engine = { path = "../../../../../../boa/boa_engine" }
        getrandom = { version = "0.2.3", features = ["custom"] }
        serde = "1.0.137"
        azle-js-value-derive = { path = "./azle_js_value_derive" }
        async-recursion = "1.0.0"
    `;
}
