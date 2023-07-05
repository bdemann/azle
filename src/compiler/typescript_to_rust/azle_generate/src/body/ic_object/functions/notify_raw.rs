pub fn generate() -> proc_macro2::TokenStream {
    quote::quote! {
        fn notify_raw(
            _this: &boa_engine::JsValue,
            aargs: &[boa_engine::JsValue],
            context: &mut boa_engine::Context,
        ) -> boa_engine::JsResult<boa_engine::JsValue> {
            let canister_id_js_value = aargs
                .get(0)
                .ok_or_else(|| {
                    boa_engine::error::JsNativeError::error()
                        .with_message("An argument for 'canisterId' was not provided")
                })?
                .clone();
            let method_js_value = aargs
                .get(1)
                .ok_or_else(|| {
                    boa_engine::error::JsNativeError::error()
                        .with_message("An argument for 'method' was not provided")
                })?
                .clone();
            let args_raw_js_value = aargs
                .get(2)
                .ok_or_else(|| {
                    boa_engine::error::JsNativeError::error()
                        .with_message("An argument for 'argsRaw' was not provided")
                })?
                .clone();
            let payment_js_value = aargs
                .get(3)
                .ok_or_else(|| {
                    boa_engine::error::JsNativeError::error()
                        .with_message("An argument for 'payment' was not provided")
                })?
                .clone();

            let canister_id_principal: ic_cdk::export::Principal = canister_id_js_value
                .try_from_vm_value(&mut *context)
                .map_err(|vmc_err| vmc_err.to_js_error())?;
            let method_string: String = method_js_value
                .try_from_vm_value(&mut *context)
                .map_err(|vmc_err| vmc_err.to_js_error())?;
            let args_raw_vec: Vec<u8> = args_raw_js_value
                .try_from_vm_value(&mut *context)
                .map_err(|vmc_err| vmc_err.to_js_error())?;
            let payment: u128 = payment_js_value
                .try_from_vm_value(&mut *context)
                .map_err(|vmc_err| vmc_err.to_js_error())?;

            let notify_result = ic_cdk::api::call::notify_raw(
                canister_id_principal,
                &method_string,
                &args_raw_vec,
                payment,
            );

            notify_result
                .try_into_vm_value(context)
                .map_err(|vmc_err| vmc_err.to_js_error())
        }
    }
}
