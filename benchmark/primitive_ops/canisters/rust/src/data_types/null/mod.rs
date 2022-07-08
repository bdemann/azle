use std::collections::HashMap;
use std::cell::RefCell;

thread_local! {
    static NULL_INIT_HEAP_STORAGE_REF_CELL: RefCell<NullInitHeapStorage> = RefCell::default();
}

type NullInitHeapStorage = HashMap<String, ()>;

#[ic_cdk_macros::update]
pub fn null_init_stack(num_inits: u32) -> u64 {
    let mut i = 0;

    while i < num_inits {
        let value: () = if i % 2 == 0 { () } else { () };
        ic_cdk::println!("{:#?}", value);
        i += 1;
    }

    ic_cdk::api::call::performance_counter(0)
}

#[ic_cdk_macros::update]
pub fn null_init_heap(num_inits: u32) -> u64 {
    NULL_INIT_HEAP_STORAGE_REF_CELL.with(|null_init_heap_storage_ref_cell| {
        let mut i = 0;
        let mut null_init_heap_storage = null_init_heap_storage_ref_cell.borrow_mut();

        while i < num_inits {
            null_init_heap_storage.insert(
                format!("element{}", i),
                if i % 2 == 0 { () } else { () }
            );
            
            i += 1;
        }
    });

    ic_cdk::api::call::performance_counter(0)
}