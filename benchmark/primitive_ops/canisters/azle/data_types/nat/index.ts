import { ic, nat, nat32, nat64, Update } from 'azle';

let nat_init_heap_storage: { [key: string]: nat | undefined; } = {};

export function nat_init_stack(num_inits: nat32): Update<nat64> {
    const performance_start = ic.performance_counter(0);

    let i = 0;

    while (i < num_inits) {
        let value = i % 2 === 0 ? 340_282_366_920_938_463_463_374_607_431_768_211_455n : 0n;
        console.log(value);
        i += 1;
    }

    const performance_end = ic.performance_counter(0);

    return performance_end - performance_start;
}

export function nat_init_heap(num_inits: nat32): Update<nat64> {
    const performance_start = ic.performance_counter(0);

    let i = 0;

    while (i < num_inits) {
        nat_init_heap_storage[`nat${i}`] = i % 2 === 0 ? 340_282_366_920_938_463_463_374_607_431_768_211_455n : 0n;
        i += 1;
    }

    const performance_end = ic.performance_counter(0);

    return performance_end - performance_start;

}

// TODO add in all nat types