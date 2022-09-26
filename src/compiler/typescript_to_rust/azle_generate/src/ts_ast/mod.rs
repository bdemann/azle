use std::collections::{HashMap, HashSet};
use swc_ecma_ast::TsTypeAliasDecl;

pub use ts_ast::TsAst;

mod ts_array_type;
mod ts_ast;
mod ts_fn_or_constructor_type;
mod ts_fn_type;
mod ts_method_signature;
mod ts_tuple_type;
mod ts_type;
mod ts_type_lit;
mod ts_type_ref;

pub mod fn_decl;
pub mod ident;
pub mod module;
pub mod program;
pub mod ts_type_alias_decl;
pub mod ts_types_to_act;

pub trait GetDependencies {
    fn get_dependent_types(
        &self,
        type_alias_lookup: &HashMap<String, TsTypeAliasDecl>,
        found_types: &HashSet<String>,
    ) -> Vec<String>;
}

pub trait GetName {
    fn get_name(&self) -> &str;
}
