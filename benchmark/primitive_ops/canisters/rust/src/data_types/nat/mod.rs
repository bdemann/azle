use std::collections::HashMap;
use std::cell::RefCell;

thread_local! {
    static NAT_INIT_HEAP_STORAGE_REF_CELL: RefCell<NatInitHeapStorage> = RefCell::default();
}

type NatInitHeapStorage = HashMap<String, ic_cdk::export::candid::Nat>;

#[ic_cdk_macros::update]
pub fn nat_init_stack(num_inits: u32) -> u64 {
    let performance_start = ic_cdk::api::call::performance_counter(0);

    let mut i = 0;

    while i < num_inits {
        let value = if i % 2 == 0 { ic_cdk::export::candid::Nat(340_282_366_920_938_463_463_374_607_431_768_211_455u128.into()) } else { ic_cdk::export::candid::Nat(0u128.into()) };
        ic_cdk::println!("{}", value);
        i += 1;
    }

    let performance_end = ic_cdk::api::call::performance_counter(0);

    performance_end - performance_start
}

#[ic_cdk_macros::update]
pub fn nat_init_heap(num_inits: u32) -> u64 {
    let performance_start = ic_cdk::api::call::performance_counter(0);

    NAT_INIT_HEAP_STORAGE_REF_CELL.with(|nat_init_heap_storage_ref_cell| {
        let mut i = 0;
        let mut nat_init_heap_storage = nat_init_heap_storage_ref_cell.borrow_mut();

        while i < num_inits {
            nat_init_heap_storage.insert(
                format!("nat{}", i),
                if i % 2 == 0 { ic_cdk::export::candid::Nat(340_282_366_920_938_463_463_374_607_431_768_211_455u128.into()) } else { ic_cdk::export::candid::Nat(0u128.into()) }
            );
            
            i += 1;
        }
    });

    let performance_end = ic_cdk::api::call::performance_counter(0);

    performance_end - performance_start
}