import { Principal } from '@dfinity/principal';

import { CandidMeta } from 'azle/property_tests/arbitraries/candid/candid_arb';
import { Named } from 'azle/property_tests';

export function generateBody(
    namedParamServices: Named<CandidMeta<Principal>>[],
    returnService: CandidMeta<Principal>
): string {
    const paramsAreServices = namedParamServices
        .map((param) => {
            const paramIsAService = `(${
                param.name
            } as any).principal.toText() === "${param.el.agentArgumentValue.toText()}"`;

            const throwError = `throw new Error('${param.name} must be a Service');`;

            return `if (!(${paramIsAService})) ${throwError}`;
        })
        .join('\n');

    const returnStatement = returnService.src.valueLiteral;

    return `
        ${paramsAreServices}

        return ${returnStatement};
    `;
}
