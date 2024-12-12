use rquickjs::{Ctx, Function, IntoJs, Result, TypedArray, Undefined, Value};

use crate::stable_b_tree_map::{with_stable_b_tree_map_mut, AzleStableBTreeMapKey};

pub fn get_function(ctx: Ctx) -> Result<Function> {
    Function::new(
        ctx.clone(),
        move |memory_id: u8, key_typed_array: TypedArray<u8>| -> Result<Value> {
            with_stable_b_tree_map_mut(ctx.clone(), memory_id, |stable_b_tree_map| {
                let key_slice: &[u8] = key_typed_array.as_ref();
                let key: Vec<u8> = key_slice.to_vec();

                match stable_b_tree_map.remove(&AzleStableBTreeMapKey { bytes: key }) {
                    Some(value) => {
                        TypedArray::<u8>::new(ctx.clone(), value.bytes.as_slice())?.into_js(&ctx)
                    }
                    None => Undefined.into_js(&ctx),
                }
            })?
        },
    )
}