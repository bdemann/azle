use std::collections::HashMap;
use std::cell::RefCell;

thread_local! {
    static FLOAT64_INIT_HEAP_STORAGE_REF_CELL: RefCell<Float64InitHeapStorage> = RefCell::default();
}

type Float64InitHeapStorage = HashMap<String, f64>;

#[ic_cdk_macros::update]
pub fn float64_init_stack(num_inits: u32) -> u64 {
    let mut i = 0;

    while i < num_inits {
        let value: f64 = if i % 2 == 0 { std::f64::consts::PI } else { std::f64::consts::E };
        ic_cdk::println!("{}", value);
        i += 1;
    }

    ic_cdk::api::call::performance_counter(0)
}

#[ic_cdk_macros::update]
pub fn float64_init_heap(num_inits: u32) -> u64 {
    FLOAT64_INIT_HEAP_STORAGE_REF_CELL.with(|float64_init_heap_storage_ref_cell| {
        let mut i = 0;
        let mut float64_init_heap_storage = float64_init_heap_storage_ref_cell.borrow_mut();

        while i < num_inits {
            float64_init_heap_storage.insert(
                format!("element{}", i),
                if i % 2 == 0 { std::f64::consts::PI } else { std::f64::consts::E }
            );
            
            i += 1;
        }
    });
        
    ic_cdk::api::call::performance_counter(0)
}