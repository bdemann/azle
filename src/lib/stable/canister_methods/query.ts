import { IDL } from '@dfinity/candid';

import { executeAndReplyWithCandidSerde } from '../execute_with_candid_serde';
import { trap } from '../ic_apis';

export function query<This, Args extends any[], Return>(
    paramIdlTypes: IDL.Type[],
    returnIdlType?: IDL.Type,
    options?: {
        composite?: boolean;
        manual?: boolean;
    }
) {
    return (
        originalMethod: (this: This, ...args: Args) => Return,
        context: ClassMethodDecoratorContext
    ): void => {
        const index = globalThis._azleCanisterMethodsIndex++;
        const name = context.name as string;
        const composite = options?.composite ?? false;
        const indexString = index.toString();

        globalThis._azleMethodMeta.queries?.push({
            name,
            index,
            composite
        });

        globalThis._azleCanisterMethodIdlTypes[name] = IDL.Func(
            paramIdlTypes,
            returnIdlType === undefined ? [] : [returnIdlType],
            ['query']
        );

        globalThis._azleCallbacks[indexString] = async (
            ...args: any[]
        ): Promise<void> => {
            try {
                await executeAndReplyWithCandidSerde(
                    'query',
                    args,
                    originalMethod.bind(globalThis._azleCanisterClassInstance),
                    paramIdlTypes,
                    returnIdlType,
                    options?.manual ?? false
                );
            } catch (error: any) {
                trap(`Uncaught Error: ${error.toString()}`);
            }
        };
    };
}
