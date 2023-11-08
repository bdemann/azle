use std::convert::TryInto;

use quickjs_wasm_rs::{to_qjs_value, CallbackArg, JSContextRef, JSValue, JSValueRef};

use crate::STABLE_B_TREE_MAPS;

pub fn native_function<'a>(
    context: &'a JSContextRef,
    _this: &CallbackArg,
    args: &[CallbackArg],
) -> Result<JSValueRef<'a>, anyhow::Error> {
    let memory_id: usize = args
        .get(0)
        .expect("stable_b_tree_map_values argument 0 is undefined")
        .to_js_value()?
        .try_into()?;

    let start_index: usize = args
        .get(1)
        .expect("stable_b_tree_map_values argument 1 is undefined")
        .to_js_value()?
        .try_into()?;

    let length: usize = args
        .get(2)
        .expect("stable_b_tree_map_values argument 2 is undefined")
        .to_js_value()?
        .try_into()?;

    let values: Vec<Vec<u8>> = STABLE_B_TREE_MAPS.with(|stable_b_tree_maps| {
        let stable_b_tree_maps = stable_b_tree_maps.borrow();
        let stable_b_tree_map = &stable_b_tree_maps[&(memory_id as u8)];

        stable_b_tree_map
            .iter()
            .skip(start_index)
            .take(if length == 0 {
                stable_b_tree_map.len().try_into().unwrap()
            } else {
                length
            })
            .map(|(_, value)| value.candid_bytes)
            .collect()
    });

    let js_values: Vec<JSValue> = values.into_iter().map(|value| value.into()).collect();
    let js_value: JSValue = js_values.into();

    to_qjs_value(&context, &js_value)
}
