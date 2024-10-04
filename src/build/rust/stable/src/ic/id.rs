use rquickjs::{Ctx, Function, TypedArray};

pub fn get_function(context: Ctx) -> Function {
    Function::new(context.clone(), move || {
        TypedArray::<u8>::new(context.clone(), ic_cdk::id().as_slice())
    })
    .unwrap()
}
