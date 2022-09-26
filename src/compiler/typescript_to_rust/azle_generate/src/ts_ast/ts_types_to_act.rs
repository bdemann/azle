use crate::cdk_act::nodes::data_type_nodes::act_funcs::Func;
use crate::cdk_act::nodes::data_type_nodes::act_record::Record;
use crate::cdk_act::nodes::data_type_nodes::act_tuple::Tuple;
use crate::cdk_act::nodes::data_type_nodes::act_variants::Variant;
use crate::cdk_act::nodes::data_type_nodes::{
    ActArray, ActArrayLiteral, ActArrayTypeAlias, ActDataTypeNode, ActFunc, ActOption,
    ActOptionLiteral, ActOptionTypeAlias, ActPrimitive, ActPrimitiveLit, ActPrimitiveTypeAlias,
    ActRecord, ActRecordMember, ActTuple, ActTupleElem, ActTypeRef, ActTypeRefLit,
    ActTypeRefTypeAlias, ActVariant, ActVariantMember,
};
use crate::generators::funcs;
use core::panic;
use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};
use swc_ecma_ast::{
    TsArrayType, TsFnType, TsKeywordType, TsKeywordTypeKind, TsPropertySignature, TsTupleType,
    TsType, TsTypeElement, TsTypeLit, TsTypeRef,
};

use crate::cdk_act::actable::ToActDataType;

impl ToActDataType for TsType {
    fn to_act_data_type(&self, name: &Option<&String>) -> ActDataTypeNode {
        match self {
            TsType::TsKeywordType(ts_keyword_type) => ts_keyword_type.to_act_data_type(name),
            TsType::TsTypeRef(ts_type_ref) => parse_ts_type_ref(ts_type_ref, name),
            TsType::TsArrayType(ts_array_type) => parse_ts_array_type(ts_array_type, name),
            TsType::TsTypeLit(ts_type_lit) => {
                ActDataTypeNode::Record(parse_ts_type_lit_as_struct(name, ts_type_lit))
            }
            TsType::TsTupleType(ts_tuple_type) => {
                ActDataTypeNode::Tuple(parse_ts_tuple_type(ts_tuple_type, name))
            }
            TsType::TsThisType(_) => todo!("to_act_data_type for TsThisType"),
            TsType::TsFnOrConstructorType(_) => {
                todo!("to_act_data_type for TsFnOorConstructorType")
            }
            TsType::TsTypeQuery(_) => todo!("to_act_data_type for TsTypeQuery"),
            TsType::TsOptionalType(_) => todo!("to_act_data_type for TsOptionalType"),
            TsType::TsRestType(_) => todo!("to_act_data_type for TsRestType"),
            TsType::TsUnionOrIntersectionType(_) => {
                todo!("to_act_data_type for TsUnionOrIntersectionType")
            }
            TsType::TsConditionalType(_) => todo!("to_act_data_type for TsConditionalType"),
            TsType::TsInferType(_) => todo!("to_act_data_type for TsInferType"),
            TsType::TsParenthesizedType(_) => todo!("to_act_data_type for TsParenthesizedType"),
            TsType::TsTypeOperator(_) => todo!("to_act_data_type for TsTypeOperator"),
            TsType::TsIndexedAccessType(_) => todo!("to_act_data_type for TsIndexedAccessType"),
            TsType::TsMappedType(_) => todo!("to_act_data_type for TsMappedType"),
            TsType::TsLitType(_) => todo!("to_act_data_type for TsLitType"),
            TsType::TsTypePredicate(_) => todo!("to_act_data_type for TsTypePredicate"),
            TsType::TsImportType(_) => todo!("to_act_data_type for TsImportType"),
        }
    }
}

impl ToActDataType for TsKeywordType {
    fn to_act_data_type(&self, name: &Option<&String>) -> ActDataTypeNode {
        let kind = self.kind;
        let token_stream = match &kind {
            TsKeywordTypeKind::TsBooleanKeyword => ActPrimitiveLit::Bool,
            TsKeywordTypeKind::TsStringKeyword => ActPrimitiveLit::String,
            TsKeywordTypeKind::TsVoidKeyword => ActPrimitiveLit::Void,
            TsKeywordTypeKind::TsNullKeyword => ActPrimitiveLit::Null,
            TsKeywordTypeKind::TsObjectKeyword => {
                todo!("to_act_data_type for TsObjectKeyword")
            }
            TsKeywordTypeKind::TsNumberKeyword => {
                todo!("to_act_data_type for TsNumberKeyword")
            }
            TsKeywordTypeKind::TsBigIntKeyword => {
                todo!("to_act_data_type for TsBigIntKeyword")
            }
            TsKeywordTypeKind::TsNeverKeyword => todo!("to_act_data_type for TsNeverKeyword"),
            TsKeywordTypeKind::TsSymbolKeyword => {
                todo!("to_act_data_type for TsSymbolKeyword")
            }
            TsKeywordTypeKind::TsIntrinsicKeyword => {
                todo!("to_act_data_type for TsIntrinsicKeyword")
            }
            TsKeywordTypeKind::TsUndefinedKeyword => {
                todo!("to_act_data_type for TsUndefinedKeyword")
            }
            TsKeywordTypeKind::TsUnknownKeyword => {
                todo!("to_act_data_type for TsUnknownKeyword")
            }
            TsKeywordTypeKind::TsAnyKeyword => todo!("to_act_data_type for TsAnyKeyword"),
        };
        build_act_primitive_type_node(token_stream, name)
    }
}

fn parse_ts_tuple_type(ts_tuple_type: &TsTupleType, name: &Option<&String>) -> ActTuple {
    let elem_types = get_elem_types(ts_tuple_type);

    match name {
        Some(name) => ActTuple::TypeAlias(Tuple {
            name: name.clone().clone(),
            elems: elem_types,
        }),
        None => ActTuple::Literal(Tuple {
            name: generate_inline_ident_for_tuple(ts_tuple_type),
            elems: elem_types,
        }),
    }
}

fn get_elem_types(ts_tuple_type: &TsTupleType) -> Vec<ActTupleElem> {
    ts_tuple_type
        .elem_types
        .iter()
        .map(|elem| ActTupleElem {
            elem_type: elem.ty.to_act_data_type(&None),
        })
        .collect()
}

fn build_act_primitive_type_node(
    primitive_type: ActPrimitiveLit,
    name: &Option<&String>,
) -> ActDataTypeNode {
    let primitive = match name {
        None => ActPrimitive::Literal(primitive_type),
        Some(name) => ActPrimitive::TypeAlias(ActPrimitiveTypeAlias {
            name: name.clone().clone(),
            aliased_type: primitive_type,
        }),
    };
    ActDataTypeNode::Primitive(primitive)
}

fn build_act_custom_type_node(token_stream: String, name: &Option<&String>) -> ActDataTypeNode {
    let type_ref = match name {
        None => ActTypeRef::Literal(ActTypeRefLit { name: token_stream }),
        Some(name) => ActTypeRef::TypeAlias(ActTypeRefTypeAlias {
            name: name.clone().clone(),
            aliased_type: ActTypeRefLit { name: token_stream },
        }),
    };
    ActDataTypeNode::TypeRef(type_ref)
}

fn parse_ts_type_ref(ts_type_ref: &TsTypeRef, name: &Option<&String>) -> ActDataTypeNode {
    let type_name = ts_type_ref
        .type_name
        .as_ident()
        .unwrap()
        .sym
        .chars()
        .as_str();
    match type_name {
        "blob" => build_act_primitive_type_node(ActPrimitiveLit::Blob, name),
        "float32" => build_act_primitive_type_node(ActPrimitiveLit::Float32, name),
        "float64" => build_act_primitive_type_node(ActPrimitiveLit::Float64, name),
        "int" => build_act_primitive_type_node(ActPrimitiveLit::Int, name),
        "int8" => build_act_primitive_type_node(ActPrimitiveLit::Int8, name),
        "int16" => build_act_primitive_type_node(ActPrimitiveLit::Int16, name),
        "int32" => build_act_primitive_type_node(ActPrimitiveLit::Int32, name),
        "int64" => build_act_primitive_type_node(ActPrimitiveLit::Int64, name),
        "nat" => build_act_primitive_type_node(ActPrimitiveLit::Nat, name),
        "nat8" => build_act_primitive_type_node(ActPrimitiveLit::Nat8, name),
        "nat16" => build_act_primitive_type_node(ActPrimitiveLit::Nat16, name),
        "nat32" => build_act_primitive_type_node(ActPrimitiveLit::Nat32, name),
        "nat64" => build_act_primitive_type_node(ActPrimitiveLit::Nat64, name),
        "Principal" => build_act_primitive_type_node(ActPrimitiveLit::Principal, name),
        "empty" => build_act_primitive_type_node(ActPrimitiveLit::Empty, name),
        "reserved" => build_act_primitive_type_node(ActPrimitiveLit::Reserved, name),
        "Opt" => parse_opt_type_ref(ts_type_ref, name),
        "Func" => parse_func_type_ref(ts_type_ref, name),
        "Variant" => parse_variant_type_ref(ts_type_ref, name),
        _ => build_act_custom_type_node(type_name.to_string(), name),
    }
}

fn parse_ts_array_type(ts_array_type: &TsArrayType, name: &Option<&String>) -> ActDataTypeNode {
    let elem_ts_type = *ts_array_type.elem_type.clone();
    let act_elem = elem_ts_type.to_act_data_type(&None);
    match name {
        Some(name) => ActDataTypeNode::Array(ActArray::TypeAlias(ActArrayTypeAlias {
            name: name.clone().clone(),
            enclosed_type: Box::from(act_elem.clone()),
        })),
        None => ActDataTypeNode::Array(ActArray::Literal(ActArrayLiteral {
            enclosed_type: Box::from(act_elem.clone()),
        })),
    }
}

fn parse_opt_type_ref(ts_type_ref: &TsTypeRef, name: &Option<&String>) -> ActDataTypeNode {
    let type_params = ts_type_ref.type_params.clone();
    match type_params {
        Some(params) => {
            // TODO do we want to check that 0 is the only valid index?
            let enclosed_ts_type = *params.params[0].clone();
            let enclosed_rust_type = enclosed_ts_type.to_act_data_type(&None);
            match name {
                Some(name) => ActDataTypeNode::Option(ActOption::TypeAlias(ActOptionTypeAlias {
                    name: name.clone().clone(),
                    enclosed_type: Box::from(enclosed_rust_type),
                })),
                None => ActDataTypeNode::Option(ActOption::Literal(ActOptionLiteral {
                    enclosed_type: Box::from(enclosed_rust_type),
                })),
            }
        }
        None => todo!("Opt must have an enclosed type"),
    }
}

fn parse_func_type_ref(ts_type_ref: &TsTypeRef, name: &Option<&String>) -> ActDataTypeNode {
    let inline_ident = generate_inline_ident_for_func(ts_type_ref);
    let type_ident = match name {
        Some(type_ident) => type_ident,
        None => &inline_ident,
    };
    let ts_type = match &ts_type_ref.type_params {
        Some(type_params) => match &*type_params.params[0] {
            TsType::TsFnOrConstructorType(fn_or_const) => match fn_or_const {
                swc_ecma_ast::TsFnOrConstructorType::TsFnType(ts_fn_type) => ts_fn_type,
                swc_ecma_ast::TsFnOrConstructorType::TsConstructorType(_) => todo!(),
            },
            _ => todo!(),
        },
        None => todo!(),
    };
    let return_type = parse_func_return_type(ts_type);
    let param_types = parse_func_param_types(ts_type);
    let func_mode = funcs::get_func_mode(ts_type);
    let params = funcs::get_param_types(ts_type);
    let return_type_string = funcs::get_return_type(ts_type);

    let func_info = Func {
        is_inline: name.is_none(),
        name: type_ident.clone(),
        params: param_types,
        return_type: Box::from(return_type),
        mode: func_mode,
        param_strings: params,
        return_string: return_type_string,
    };
    let act_func = match name {
        Some(_) => ActFunc::TypeAlias(func_info),
        None => ActFunc::Literal(func_info),
    };
    ActDataTypeNode::Func(act_func)
}

// Same comment as parse_func_param_types
fn parse_func_return_type(ts_type: &TsFnType) -> ActDataTypeNode {
    // This feels a little weird to ignore the query update and oneway of theses fun return types, but for right now I just need the inline goodies
    match &*ts_type.type_ann.type_ann {
        TsType::TsTypeRef(type_reference) => match &type_reference.type_params {
            Some(type_param_inst) => match type_param_inst.params.get(0) {
                Some(param) => param.to_act_data_type(&None),
                None => panic!("Func must specify exactly one return type"),
            },
            None => {
                // TODO Handle Oneways more elegantly. Probably by using the
                // funcs.rs version of this function that is much more robust
                // the only problem is that it returns a token stream  instead
                // of a rust type and we need the rust type in order to evaluate
                // any inline dependencies we have
                if type_reference
                    .type_name
                    .as_ident()
                    .unwrap()
                    .sym
                    .chars()
                    .as_str()
                    == "Oneway"
                {
                    ActDataTypeNode::TypeRef(ActTypeRef::Literal(ActTypeRefLit {
                        name: "".to_string(),
                    }))
                } else {
                    panic!("Func must specify a return type")
                }
            }
        },
        _ => panic!("Must be a Query or Update or Oneway (which are all type refs"),
    }
}

// TODO can we merge this with funcs.rs's get_param_types? Or have that function use
// This one and then grab the info out for the token streams?
fn parse_func_param_types(ts_type: &TsFnType) -> Vec<ActDataTypeNode> {
    ts_type
        .params
        .iter()
        .map(|param| match param {
            swc_ecma_ast::TsFnParam::Ident(ident) => match &ident.type_ann {
                Some(param_type) => {
                    let ts_type = &*param_type.type_ann;
                    ts_type.to_act_data_type(&None)
                }
                None => panic!("Func parameter must have a type"),
            },
            _ => panic!("Func parameter must be an identifier"),
        })
        .collect()
}

fn parse_variant_type_ref(ts_type_ref: &TsTypeRef, name: &Option<&String>) -> ActDataTypeNode {
    let enclosed_type = &*ts_type_ref.type_params.as_ref().unwrap().params[0];
    let enclosed_type_lit = enclosed_type.as_ts_type_lit().unwrap();
    ActDataTypeNode::Variant(parse_ts_type_lit_as_enum(name, &enclosed_type_lit))
}

fn parse_ts_type_lit_as_enum(name: &Option<&String>, ts_type_lit: &TsTypeLit) -> ActVariant {
    let members: Vec<ActVariantMember> = ts_type_lit.members.iter().fold(vec![], |acc, member| {
        let result = parse_type_literal_members_for_enum(member);
        vec![acc, vec![result]].concat()
    });
    match name {
        Some(name) => ActVariant::TypeAlias(Variant {
            name: name.clone().clone(),
            members,
        }),
        None => ActVariant::Literal(Variant {
            name: generate_inline_ident(ts_type_lit),
            members,
        }),
    }
}

fn parse_ts_type_lit_as_struct(name: &Option<&String>, ts_type_lit: &TsTypeLit) -> ActRecord {
    let members: Vec<ActRecordMember> = ts_type_lit.members.iter().fold(vec![], |acc, member| {
        let structures = parse_type_literal_fields(member);
        vec![acc, vec![structures]].concat()
    });

    match name {
        Some(name) => ActRecord::TypeAlias(Record {
            name: name.clone().clone(),
            members,
        }),
        None => ActRecord::Literal(Record {
            name: generate_inline_ident(ts_type_lit),
            members,
        }),
    }
}

fn parse_type_literal_fields(member: &TsTypeElement) -> ActRecordMember {
    match member.as_ts_property_signature() {
        Some(prop_sig) => ActRecordMember {
            member_name: parse_type_literal_member_name(prop_sig),
            member_type: parse_type_literal_member_type(prop_sig),
        },
        None => todo!("Handle parsing type literals if the field isn't a TsPropertySignature"),
    }
}

fn parse_type_literal_member_name(prop_sig: &TsPropertySignature) -> String {
    prop_sig
        .key
        .as_ident()
        .unwrap()
        .sym
        .chars()
        .as_str()
        .to_string()
}

pub fn parse_type_literal_member_type(prop_sig: &TsPropertySignature) -> ActDataTypeNode {
    let type_ann = prop_sig.type_ann.clone().unwrap();
    let ts_type = *type_ann.type_ann.clone();
    ts_type.to_act_data_type(&None)
}

fn parse_type_literal_members_for_enum(member: &TsTypeElement) -> ActVariantMember {
    match member.as_ts_property_signature() {
        Some(prop_sig) => ActVariantMember {
            member_name: parse_type_literal_member_name(prop_sig),
            member_type: parse_type_literal_member_type(prop_sig),
        },
        None => todo!("Handle parsing type literals if the member isn't a TsPropertySignature"),
    }
}

fn generate_inline_ident(ts_type_lit: &TsTypeLit) -> String {
    let id = calculate_hash(ts_type_lit);
    // TODO could a variant and a struct produce the same hash if they have the same inline part?
    format!("AzleInline{}", id)
}

fn generate_inline_ident_for_func(ts_type_ref: &TsTypeRef) -> String {
    let id = calculate_hash(ts_type_ref);
    format!("AzleInlineFunc{}", id)
}

fn generate_inline_ident_for_tuple(ts_type_ref: &TsTupleType) -> String {
    let id = calculate_hash(ts_type_ref);
    format!("AzleInlineTuple{}", id)
}

fn calculate_hash<T: Hash>(hash: &T) -> String {
    let mut s = DefaultHasher::new();
    hash.hash(&mut s);
    format!("{}", s.finish()).to_string()
}
