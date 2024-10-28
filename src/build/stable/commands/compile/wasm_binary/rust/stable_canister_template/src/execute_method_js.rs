use crate::{
    benchmarking::record_benchmark, error::quickjs_call_with_error_handling, quickjs_with_ctx,
    WASM_DATA_REF_CELL,
};

#[no_mangle]
#[allow(unused)]
pub extern "C" fn execute_method_js(function_index: i32, pass_arg_data: i32) {
    let function_name = function_index.to_string();
    let pass_arg_data = pass_arg_data == 1;

    let quickjs_result = quickjs_with_ctx(|ctx| {
        let callbacks: rquickjs::Object = ctx
            .clone()
            .globals()
            .get("_azleCallbacks")
            .map_err(|e| format!("Failed to get _azleCallbacks global: {}", e))?;

        let method_callback: rquickjs::Function = callbacks
            .get(&function_name)
            .map_err(|e| format!("Failed to get method callback from _azleCallbacks: {}", e))?;

        let candid_args = if pass_arg_data {
            ic_cdk::api::call::arg_data_raw()
        } else {
            vec![]
        };

        quickjs_call_with_error_handling(ctx.clone(), method_callback, (candid_args,))?;

        Ok(())
    });

    if let Err(e) = quickjs_result {
        ic_cdk::trap(&format!("Azle CanisterMethodError: {}", e));
    }

    if WASM_DATA_REF_CELL.with(|wasm_data_ref_cell| {
        wasm_data_ref_cell
            .borrow()
            .as_ref()
            .unwrap()
            .record_benchmarks
    }) {
        let instructions = ic_cdk::api::performance_counter(1);
        record_benchmark(&function_name, instructions);
    }
}
