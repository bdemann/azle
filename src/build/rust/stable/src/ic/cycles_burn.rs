use rquickjs::{Context, Ctx, Function};

pub fn get_function(context: Ctx) -> Function {
    Function::new(context.clone(), move |amount_string: String| {
        let amount: u128 = amount_string.parse().unwrap();

        ic_cdk::api::cycles_burn(amount).to_string()
    })
    .unwrap()
}
