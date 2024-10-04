type RejectionCode =
    | {
          NoError: null;
      }
    | {
          SysFatal: null;
      }
    | {
          SysTransient: null;
      }
    | {
          DestinationInvalid: null;
      }
    | {
          CanisterReject: null;
      }
    | {
          CanisterError: null;
      }
    | {
          Unknown: null;
      };

/**
 * Returns the rejection code from the most recently executed cross-canister
 * call
 * @returns the rejection code
 */
export function rejectCode(): RejectionCode {
    if (globalThis._azleIcStable === undefined) {
        return { Unknown: null };
    }

    const rejectCodeNumber = globalThis._azleIcStable.rejectCode();

    switch (rejectCodeNumber) {
        case 0:
            return { NoError: null };
        case 1:
            return { SysFatal: null };
        case 2:
            return { SysTransient: null };
        case 3:
            return { DestinationInvalid: null };
        case 4:
            return { CanisterReject: null };
        case 5:
            return { CanisterError: null };
        case 6:
            return { Unknown: null };
        default:
            throw Error(`Unknown rejection code: ${rejectCodeNumber}`);
    }
}
