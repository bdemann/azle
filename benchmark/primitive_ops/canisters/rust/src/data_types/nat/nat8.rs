use std::collections::HashMap;
use std::cell::RefCell;

thread_local! {
    static NAT8_INIT_HEAP_STORAGE_REF_CELL: RefCell<Nat8InitHeapStorage> = RefCell::default();
}

type Nat8InitHeapStorage = HashMap<String, u8>;

#[ic_cdk_macros::update]
pub fn nat8_init_stack(num_inits: u32) -> u64 {
    let mut i = 0;

    while i < num_inits {
        let value: u8 = if i % 2 == 0 { 255 } else { 0 };
        ic_cdk::println!("{}", value);
        i += 1;
    }

    ic_cdk::api::call::performance_counter(0)
}

#[ic_cdk_macros::update]
pub fn nat8_init_heap(num_inits: u32) -> u64 {
    NAT8_INIT_HEAP_STORAGE_REF_CELL.with(|nat8_init_heap_storage_ref_cell| {
        let mut i = 0;
        let mut nat8_init_heap_storage = nat8_init_heap_storage_ref_cell.borrow_mut();

        while i < num_inits {
            nat8_init_heap_storage.insert(
                format!("element{}", i),
                if i % 2 == 0 { 255 } else { 0 }
            );
            
            i += 1;
        }
    });

    ic_cdk::api::call::performance_counter(0)
}