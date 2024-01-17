use std::convert::TryInto;

use slotmap::Key;
use wasmedge_quickjs::{AsObject, Context, JsFn, JsValue};

use crate::RUNTIME;

pub struct NativeFunction;
impl JsFn for NativeFunction {
    fn call(context: &mut Context, this_val: JsValue, argv: &[JsValue]) -> JsValue {
        let interval_string = if let JsValue::String(js_string) = argv.get(0).unwrap() {
            js_string.to_string()
        } else {
            panic!("conversion from JsValue to JsString failed")
        };
        let interval_u64: u64 = interval_string.parse().unwrap();
        let interval = core::time::Duration::new(interval_u64, 0);

        let callback_id = if let JsValue::String(js_string) = argv.get(1).unwrap() {
            js_string.to_string()
        } else {
            panic!("conversion from JsValue to JsString failed")
        };

        let closure = move || {
            RUNTIME.with(|runtime| {
                let mut runtime = runtime.borrow_mut();
                let runtime = runtime.as_mut().unwrap();

                runtime.run_with_context(|context| {
                    let global = context.get_global();

                    let timer_callback = global
                        .get("_azleTimerCallbacks")
                        .to_obj()
                        .unwrap()
                        .get(callback_id.as_str())
                        .to_function()
                        .unwrap();

                    timer_callback.call(&[]);

                    // TODO handle errors
                });
            });
        };

        let timer_id: ic_cdk_timers::TimerId = ic_cdk_timers::set_timer_interval(interval, closure);
        let timer_id_u64: u64 = timer_id.data().as_ffi();

        context.new_string(&timer_id_u64.to_string()).into()
    }
}
