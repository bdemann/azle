import { IDL } from '@dfinity/candid';

import { executeAndReplyWithCandidSerde } from '../execute_with_candid_serde';
import { trap } from '../ic_apis';

export function update<This, Args extends any[], Return>(
    paramIdlTypes: IDL.Type[],
    returnIdlType?: IDL.Type,
    options?: {
        manual?: boolean;
    }
) {
    return (
        originalMethod: (this: This, ...args: Args) => Return,
        context: ClassMethodDecoratorContext
    ): void => {
        const index = globalThis._azleCanisterMethodsIndex++;
        const name = context.name as string;
        const indexString = index.toString();
        globalThis._azleMethodMeta.updates?.push({ name, index });

        globalThis._azleCanisterMethodIdlTypes[name] = IDL.Func(
            paramIdlTypes,
            returnIdlType === undefined ? [] : [returnIdlType]
        );

        globalThis._azleCallbacks[indexString] = async (
            ...args: any[]
        ): Promise<void> => {
            try {
                await executeAndReplyWithCandidSerde(
                    'update',
                    args,
                    originalMethod.bind(globalThis._azleCanisterClassInstance),
                    paramIdlTypes,
                    returnIdlType,
                    options?.manual ?? false
                );
            } catch (error: any) {
                trap(error.toString());
            }
        };
    };
}
