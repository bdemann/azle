use std::collections::HashMap;
use std::cell::RefCell;

thread_local! {
    static NAT32_INIT_HEAP_STORAGE_REF_CELL: RefCell<Nat32InitHeapStorage> = RefCell::default();
}

type Nat32InitHeapStorage = HashMap<String, u32>;

#[ic_cdk_macros::update]
pub fn nat32_init_stack(num_inits: u32) -> u64 {
    let mut i = 0;

    while i < num_inits {
        let value: u32 = if i % 2 == 0 { 4_294_967_295 } else { 0 };
        ic_cdk::println!("{}", value);
        i += 1;
    }

    ic_cdk::api::call::performance_counter(0)
}

#[ic_cdk_macros::update]
pub fn nat32_init_heap(num_inits: u32) -> u64 {
    NAT32_INIT_HEAP_STORAGE_REF_CELL.with(|nat32_init_heap_storage_ref_cell| {
        let mut i = 0;
        let mut nat32_init_heap_storage = nat32_init_heap_storage_ref_cell.borrow_mut();

        while i < num_inits {
            nat32_init_heap_storage.insert(
                format!("element{}", i),
                if i % 2 == 0 { 4_294_967_295 } else { 0 }
            );
            
            i += 1;
        }
    });

    ic_cdk::api::call::performance_counter(0)
}