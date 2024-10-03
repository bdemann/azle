use rquickjs::{Ctx, Function};

pub fn get_function(context: Ctx) -> Function {
    Function::new(context, || ic_cdk::api::time().to_string()).unwrap()
}
