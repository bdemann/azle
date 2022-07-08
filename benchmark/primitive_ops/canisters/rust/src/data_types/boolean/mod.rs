use std::collections::HashMap;
use std::cell::RefCell;

thread_local! {
    static BOOLEAN_INIT_HEAP_STORAGE_REF_CELL: RefCell<BooleanInitHeapStorage> = RefCell::default();
}

type BooleanInitHeapStorage = HashMap<String, bool>;

#[ic_cdk_macros::update]
pub fn boolean_init_stack(num_inits: u32) -> u64 {
    let mut i = 0;

    while i < num_inits {
        let value: bool = if i % 2 == 0 { true } else { false };
        ic_cdk::println!("{}", value);
        i += 1;
    }

    ic_cdk::api::call::performance_counter(0)
}

#[ic_cdk_macros::update]
pub fn boolean_init_heap(num_inits: u32) -> u64 {
    BOOLEAN_INIT_HEAP_STORAGE_REF_CELL.with(|boolean_init_heap_storage_ref_cell| {
        let mut i = 0;
        let mut boolean_init_heap_storage = boolean_init_heap_storage_ref_cell.borrow_mut();

        while i < num_inits {
            boolean_init_heap_storage.insert(
                format!("element{}", i),
                if i % 2 == 0 { true } else { false }
            );
            
            i += 1;
        }
    });
        
    ic_cdk::api::call::performance_counter(0)
}