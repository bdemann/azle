import { IDL } from '@dfinity/candid';

import { decode } from '../../serde/decode';
import { encode } from '../../serde/encode';

export class AzleReserved {
    _azleKind: 'AzleReserved' = 'AzleReserved';
    static _azleKind: 'AzleReserved' = 'AzleReserved';

    static tsType: reserved;

    static toBytes(data: any) {
        return encode(this, data);
    }

    static fromBytes(bytes: Uint8Array) {
        return decode(this, bytes);
    }

    static getIdl() {
        return IDL.Reserved;
    }
}

export const reserved = AzleReserved;
export type reserved = any;
