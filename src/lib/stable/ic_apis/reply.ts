import { IDL } from '@dfinity/candid';

type ReplyInput<T> =
    | {
          data: T;
          idlType?: IDL.Type;
      }
    | {
          raw: Uint8Array;
      };

/**
 * Used to manually reply to an ingress message. Intended to be used in
 * canister methods with a {@link Manual} return type.
 * @param reply the value with which to reply. Must be of type `T` where `T`
 * is the generic type supplied to `Manual<T>`. Otherwise will result in an
 * uncaught `TypeError`.
 */
export function reply<T>(input: ReplyInput<T>): void {
    if (
        globalThis._azleIcStable === undefined &&
        globalThis._azleIcExperimental === undefined
    ) {
        return undefined;
    }

    if ('raw' in input) {
        return globalThis._azleIcExperimental !== undefined
            ? globalThis._azleIcExperimental.replyRaw(input.raw.buffer)
            : globalThis._azleIcStable.replyRaw(input.raw);
    } else {
        const idlType = input.idlType === undefined ? [] : [input.idlType];
        const data =
            input.data === undefined && input.idlType === undefined
                ? []
                : [input.data];

        return globalThis._azleIcExperimental !== undefined
            ? globalThis._azleIcExperimental.replyRaw(
                  // @ts-ignore IDL.encode types are defined incorrectly https://github.com/demergent-labs/azle/issues/2061
                  IDL.encode(idlType, data).buffer
              )
            : // @ts-ignore IDL.encode types are defined incorrectly https://github.com/demergent-labs/azle/issues/2061
              globalThis._azleIcStable.replyRaw(IDL.encode(idlType, data));
    }
}
