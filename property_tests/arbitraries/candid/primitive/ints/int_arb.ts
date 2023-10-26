import fc from 'fast-check';
import { Candid } from '../..';

export const IntArb = fc.bigInt().map(
    (value): Candid<bigint> => ({
        value,
        src: { candidType: 'int' }
    })
);
