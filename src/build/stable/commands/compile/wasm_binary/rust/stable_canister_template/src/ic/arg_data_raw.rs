use rquickjs::{Ctx, Function, TypedArray};

pub fn get_function(context: Ctx) -> Result<Function, rquickjs::Error> {
    Function::new(context.clone(), move || {
        TypedArray::<u8>::new(context.clone(), ic_cdk::api::call::arg_data_raw())
    })
}
