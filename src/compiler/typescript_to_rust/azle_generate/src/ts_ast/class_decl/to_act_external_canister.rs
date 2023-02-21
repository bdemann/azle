use cdk_framework::nodes::{ActExternalCanister, ActExternalCanisterMethod};
use swc_ecma_ast::{ClassDecl, ClassMember};

use crate::ts_ast::{source_map::SourceMapped, GetName};

impl SourceMapped<'_, ClassDecl> {
    pub fn to_act_external_canister(&self) -> ActExternalCanister {
        let methods = self.build_external_canister_methods();

        ActExternalCanister {
            name: self.ident.get_name().to_string(),
            methods,
        }
    }

    fn build_external_canister_methods(&self) -> Vec<ActExternalCanisterMethod> {
        self.class
            .body
            .iter()
            .fold(vec![], |mut acc, class_member| match class_member {
                ClassMember::ClassProp(class_prop) => {
                    let class_prop_with_source_map = SourceMapped::new(class_prop, self.source_map);
                    let possible_canister_method =
                        class_prop_with_source_map.to_act_external_canister_method();
                    if let Some(canister_method) = possible_canister_method {
                        acc.push(canister_method);
                    }
                    acc
                }
                _ => panic!(
                    "{}",
                    self.build_invalid_class_member_error_message(class_member)
                ),
            })
    }
}
