/**
 * Converts a Candid string into its corresponding IDL as a string
 * @param candidString a valid Candid string
 * @returns the IDL string
 */
export function candidCompiler(candidPath: string): string {
    if (globalThis._azleIc === undefined) {
        return undefined as any;
    }

    return globalThis._azleIc.candidCompiler(candidPath);
}
