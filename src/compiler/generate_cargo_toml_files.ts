import { OptLevel, Toml } from './utils/types';

export function generateWorkspaceCargoToml(optLevel: OptLevel): Toml {
    const optLevels = {
        '0': `opt-level = 'z'`,
        '1': `
            opt-level = 'z'
            lto = "thin"
        `,
        '2': `
            opt-level = 'z'
            lto = "thin"
            codegen-units = 1
        `,
        '3': `
            opt-level = 'z'
            lto = "fat"
        `,
        '4': `
            opt-level = 'z'
            lto = "fat"
            codegen-units = 1
        `
    };

    return `
        # This code is automatically generated by Azle

        [workspace]
        members = [
            "canister",
            "canister_methods",
            "open_value_sharing"
        ]

        [profile.release]
        ${optLevels[optLevel]}
    `;
}
