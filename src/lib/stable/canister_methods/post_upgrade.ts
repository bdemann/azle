import { IDL } from '@dfinity/candid';

import { executeAndReplyWithCandidSerde } from '../execute_with_candid_serde';
import { trap } from '../ic_apis';

export function postUpgrade<This, Args extends any[], Return>(
    paramIdlTypes: IDL.Type[]
) {
    return (
        originalMethod: (this: This, ...args: Args) => Return,
        context: ClassMethodDecoratorContext
    ): void => {
        const index = globalThis._azleCanisterMethodsIndex++;
        const name = context.name as string;
        const indexString = index.toString();

        globalThis._azleMethodMeta.post_upgrade = {
            name,
            index
        };

        globalThis._azleInitAndPostUpgradeIdlTypes.push(
            IDL.Func(paramIdlTypes, [], ['post_upgrade'])
        );

        globalThis._azleCallbacks[indexString] = async (
            ...args: any[]
        ): Promise<void> => {
            try {
                await executeAndReplyWithCandidSerde(
                    'postUpgrade',
                    args,
                    originalMethod.bind(globalThis._azleCanisterClassInstance),
                    paramIdlTypes,
                    undefined,
                    false
                );
            } catch (error: any) {
                trap(`Uncaught Error: ${error.toString()}`);
            }
        };
    };
}
