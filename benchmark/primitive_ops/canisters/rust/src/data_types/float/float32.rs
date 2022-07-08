use std::collections::HashMap;
use std::cell::RefCell;

thread_local! {
    static FLOAT32_INIT_HEAP_STORAGE_REF_CELL: RefCell<Float32InitHeapStorage> = RefCell::default();
}

type Float32InitHeapStorage = HashMap<String, f32>;

#[ic_cdk_macros::update]
pub fn float32_init_stack(num_inits: u32) -> u64 {
    let mut i = 0;

    while i < num_inits {
        let value: f32 = if i % 2 == 0 { std::f32::consts::PI } else { std::f32::consts::E };
        ic_cdk::println!("{}", value);
        i += 1;
    }

    ic_cdk::api::call::performance_counter(0)
}

#[ic_cdk_macros::update]
pub fn float32_init_heap(num_inits: u32) -> u64 {
    FLOAT32_INIT_HEAP_STORAGE_REF_CELL.with(|float32_init_heap_storage_ref_cell| {
        let mut i = 0;
        let mut float32_init_heap_storage = float32_init_heap_storage_ref_cell.borrow_mut();

        while i < num_inits {
            float32_init_heap_storage.insert(
                format!("element{}", i),
                if i % 2 == 0 { std::f32::consts::PI } else { std::f32::consts::E }
            );
            
            i += 1;
        }
    });
        
    ic_cdk::api::call::performance_counter(0)
}