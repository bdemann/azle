use swc_common::SourceMap;
use swc_ecma_ast::TsPropertySignature;

use crate::ts_ast::{ast_traits::GetTsType, azle_type::AzleType, GetName};
use cdk_framework::act::node::{
    data_type::{record, variant},
    to_node::ToDataType,
    DataType,
};

mod errors;
mod get_dependencies;
mod get_source_info;
mod get_source_text;

pub struct AzlePropertySignature<'a> {
    pub ts_property_signature: TsPropertySignature,
    pub source_map: &'a SourceMap,
}

impl AzlePropertySignature<'_> {
    pub(super) fn to_record_member(&self) -> record::Member {
        record::Member {
            name: self.get_member_name(),
            type_: self.get_act_data_type(),
        }
    }

    pub(super) fn to_variant_member(&self) -> variant::Member {
        variant::Member {
            name: self.get_member_name(),
            type_: self.get_act_data_type(),
        }
    }

    fn get_member_name(&self) -> String {
        self.ts_property_signature
            .key
            .as_ident()
            .expect(&self.unsupported_member_name_error().to_string())
            .get_name()
            .to_string()
    }

    fn get_act_data_type(&self) -> DataType {
        let ts_type = match &self.ts_property_signature.type_ann {
            Some(ts_type_ann) => ts_type_ann.get_ts_type(),
            None => panic!("{}", self.no_type_annotation_error()),
        };
        let azle_type = AzleType::from_ts_type(ts_type, self.source_map);
        azle_type.to_data_type()
    }
}
