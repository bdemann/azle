import {
    call,
    canisterBalance,
    IDL,
    msgCyclesRefunded,
    query,
    update
} from 'azle';

import { CyclesResult } from '../types';

export default class {
    cyclesPrincipal = getCyclesPrincipal();

    @update([IDL.Nat64], CyclesResult)
    async sendAllCycles(amount: bigint): Promise<CyclesResult> {
        const result = await call(this.cyclesPrincipal, 'receiveAllCycles', {
            returnIdlType: CyclesResult,
            cycles: amount
        });
        return { ...result, cyclesRefunded: msgCyclesRefunded() };
    }

    @update([IDL.Nat64, IDL.Nat64], CyclesResult)
    async sendVariableCycles(
        amountToSend: bigint,
        amountToAccept: bigint
    ): Promise<CyclesResult> {
        const result = await call(
            this.cyclesPrincipal,
            'receiveVariableCycles',
            {
                paramIdlTypes: [IDL.Nat64],
                returnIdlType: CyclesResult,
                args: [amountToAccept],
                cycles: amountToSend
            }
        );
        return { ...result, cyclesRefunded: msgCyclesRefunded() };
    }

    @update([IDL.Nat64], CyclesResult)
    async sendNoCycles(amount: bigint): Promise<CyclesResult> {
        const result = await call(this.cyclesPrincipal, 'receiveNoCycles', {
            returnIdlType: CyclesResult,
            cycles: amount
        });
        return { ...result, cyclesRefunded: msgCyclesRefunded() };
    }

    @update([IDL.Nat64, IDL.Nat64], CyclesResult)
    async sendCyclesByChunk(
        amount: bigint,
        numChunks: bigint
    ): Promise<CyclesResult> {
        const result = await call(
            this.cyclesPrincipal,
            'receiveCyclesByChunk',
            {
                paramIdlTypes: [IDL.Nat64],
                returnIdlType: CyclesResult,
                args: [numChunks],
                cycles: amount
            }
        );
        return { ...result, cyclesRefunded: msgCyclesRefunded() };
    }

    @query([], IDL.Bool)
    canisterBalanceTypesAreCorrect(): boolean {
        return typeof canisterBalance() === 'bigint';
    }

    @update([IDL.Nat64], IDL.Bool)
    async msgCyclesAcceptTypesAreCorrect(amount: bigint): Promise<boolean> {
        return await call(
            this.cyclesPrincipal,
            'msgCyclesAcceptTypesAreCorrect',
            {
                paramIdlTypes: [IDL.Nat64],
                returnIdlType: IDL.Bool,
                args: [amount]
            }
        );
    }

    @update([], IDL.Bool)
    async msgCyclesAvailableTypesAreCorrect(): Promise<boolean> {
        return await call(
            this.cyclesPrincipal,
            'msgCyclesAvailableTypesAreCorrect',
            {
                returnIdlType: IDL.Bool
            }
        );
    }

    @update([IDL.Nat64], IDL.Bool)
    async msgCyclesRefundedTypesAreCorrect(amount: bigint): Promise<boolean> {
        await call(this.cyclesPrincipal, 'msgCyclesAcceptTypesAreCorrect', {
            paramIdlTypes: [IDL.Nat64],
            returnIdlType: IDL.Bool,
            args: [amount]
        });
        // NOTE: if there is no cross canister call, msgCyclesRefunded() cannot be called
        return typeof msgCyclesRefunded() === 'bigint';
    }
}

function getCyclesPrincipal(): string {
    if (process.env.CYCLES_PRINCIPAL !== undefined) {
        return process.env.CYCLES_PRINCIPAL;
    }
    throw new Error('process.env.CYCLES_PRINCIPAL is undefined');
}
