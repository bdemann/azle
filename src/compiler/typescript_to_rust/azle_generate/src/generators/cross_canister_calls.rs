use quote::quote;

pub fn generate_pre_await_state_management() -> proc_macro2::TokenStream {
    quote! {
        let uuid = UUID_REF_CELL.with(|uuid_ref_cell| uuid_ref_cell.borrow().clone());
        let method_name = METHOD_NAME_REF_CELL.with(|method_name_ref_cell| method_name_ref_cell.borrow().clone());
        let manual = MANUAL_REF_CELL.with(|manual_ref_cell| manual_ref_cell.borrow().clone());
    }
}

pub fn generate_post_await_state_management() -> proc_macro2::TokenStream {
    quote! {
        UUID_REF_CELL.with(|uuid_ref_cell| {
            let mut uuid_mut = uuid_ref_cell.borrow_mut();

            *uuid_mut = uuid.clone();
        });

        METHOD_NAME_REF_CELL.with(|method_name_ref_cell| {
            let mut method_name_mut = method_name_ref_cell.borrow_mut();

            *method_name_mut = method_name.clone()
        });

        MANUAL_REF_CELL.with(|manual_ref_cell| {
            let mut manual_mut = manual_ref_cell.borrow_mut();

            *manual_mut = manual;
        });
    }
}

pub fn generate_promise_fulfillment() -> proc_macro2::TokenStream {
    quote! {
        BOA_CONTEXT_REF_CELL.with(|box_context_ref_cell| {
            let mut _azle_boa_context = box_context_ref_cell.borrow_mut();

            let call_result_js_value = match call_result {
                Ok(value) => {
                    let js_value = value.try_into_vm_value(&mut *_azle_boa_context).unwrap();

                    let canister_result_js_object = boa_engine::object::ObjectInitializer::new(&mut *_azle_boa_context)
                        .property(
                            "ok",
                            js_value,
                            boa_engine::property::Attribute::all()
                        )
                        .build();

                    let canister_result_js_value = canister_result_js_object.into();

                    canister_result_js_value
                },
                Err(err) => {
                    let js_value = format!("Rejection code {rejection_code}, {error_message}", rejection_code = (err.0 as i32).to_string(), error_message = err.1).try_into_vm_value(&mut *_azle_boa_context).unwrap();

                    let canister_result_js_object = boa_engine::object::ObjectInitializer::new(&mut *_azle_boa_context)
                        .property(
                            "err",
                            js_value,
                            boa_engine::property::Attribute::all()
                        )
                        .build();

                    let canister_result_js_value = canister_result_js_object.into();

                    canister_result_js_value
                }
            };

            let promise_js_object = promise_js_value.as_object().unwrap();
            let mut promise_object = promise_js_object.borrow_mut();
            let mut promise = promise_object.as_promise_mut().unwrap();

            promise.fulfill_promise(&call_result_js_value, &mut *_azle_boa_context);

            let main_promise = PROMISE_MAP_REF_CELL.with(|promise_map_ref_cell| {
                let promise_map = promise_map_ref_cell.borrow().clone();

                let main_promise = promise_map.get(&uuid).unwrap();

                main_promise.clone()
            });

            _azle_async_await_result_handler(&mut *_azle_boa_context, &main_promise, &uuid, &method_name, manual);
        });
    }
}