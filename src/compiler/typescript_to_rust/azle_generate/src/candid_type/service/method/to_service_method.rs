use cdk_framework::act::node::{
    candid::service::Method, node_parts::mode::Mode, CandidType, Param,
};
use swc_ecma_ast::{ClassProp, Expr, TsFnOrConstructorType, TsFnParam, TsFnType, TsType};

use crate::{
    errors::CollectResults,
    traits::{GetName, GetTsType},
    ts_ast::SourceMapped,
    Error,
};

impl SourceMapped<'_, ClassProp> {
    pub fn to_service_method(&self) -> Result<Method, Vec<Error>> {
        if self.decorators.len() == 0 {
            return Err(Error::MissingDecorator.into());
        }

        if !self.has_azle_decorator() {
            return Err(Error::InvalidDecorator.into());
        }

        let name = self.name()?;
        let mode = match &self.mode()?[..] {
            "serviceQuery" => Mode::Query,
            "serviceUpdate" => Mode::Update,
            _ => return Err(Error::InvalidDecorator.into()),
        };
        let params = self.build_act_fn_params()?;
        let return_type = self.build_return_type()?;

        Ok(Method::new(name, mode, params, return_type))
    }

    fn build_act_fn_params(&self) -> Result<Vec<Param>, Vec<Error>> {
        self.ts_fn_type()
            .map_err(Into::<Vec<Error>>::into)?
            .build_act_fn_params()
    }

    fn build_return_type(&self) -> Result<CandidType, Vec<Error>> {
        let return_ts_type = self.return_ts_type()?;
        let candid_type = SourceMapped::new(&return_ts_type, self.source_map).to_candid_type()?;
        Ok(candid_type)
    }

    fn contains_decorator(&self, name: &str) -> bool {
        self.decorators.iter().any(|decorator| {
            if let Expr::Ident(ident) = &*decorator.expr {
                return ident.get_name() == name;
            }
            false
        })
    }

    fn has_azle_decorator(&self) -> bool {
        self.contains_decorator("serviceQuery") || self.contains_decorator("serviceUpdate")
    }

    fn mode(&self) -> Result<String, Error> {
        if self.decorators.len() != 1 {
            return Err(Error::MultipleDecorators);
        };

        let mode = self
            .decorators
            .get(0)
            .unwrap()
            .expr
            .as_ident()
            .unwrap()
            .get_name()
            .to_string();

        Ok(mode)
    }

    fn name(&self) -> Result<String, Error> {
        let name = match &self.key {
            swc_ecma_ast::PropName::Ident(ident) => ident.get_name().to_string(),
            swc_ecma_ast::PropName::Str(str) => str.value.to_string(),
            swc_ecma_ast::PropName::Num(num) => num.value.to_string(),
            swc_ecma_ast::PropName::Computed(_) => return Err(Error::UnallowedComputedProperty),
            swc_ecma_ast::PropName::BigInt(big_int) => big_int.value.to_string(),
        };

        return Ok(name);
    }

    fn return_ts_type(&self) -> Result<TsType, Error> {
        let ts_fn_type = self.ts_fn_type()?;
        match &*ts_fn_type.type_ann.type_ann {
            TsType::TsTypeRef(ts_type_ref) => {
                let name = match &ts_type_ref.type_name {
                    swc_ecma_ast::TsEntityName::TsQualifiedName(_) => {
                        return Err(Error::NamespaceQualifiedType)
                    }
                    swc_ecma_ast::TsEntityName::Ident(ident) => ident.get_name().to_string(),
                };

                if name != "CallResult" {
                    return Err(Error::MissingCallResultAnnotation);
                }

                match &ts_type_ref.type_params {
                    Some(ts_type_param_inst) => {
                        if ts_type_param_inst.params.len() != 1 {
                            return Err(Error::TooManyReturnTypes);
                        }

                        let inner_type = &**ts_type_param_inst.params.get(0).unwrap();
                        Ok(inner_type.clone())
                    }
                    None => return Err(Error::MissingTypeArgument),
                }
            }
            _ => return Err(Error::MissingCallResultAnnotation),
        }
    }

    fn ts_fn_type(&self) -> Result<SourceMapped<TsFnType>, Error> {
        match &self.type_ann {
            Some(type_ann) => match &*type_ann.type_ann {
                TsType::TsFnOrConstructorType(fn_or_constructor_type) => {
                    match fn_or_constructor_type {
                        TsFnOrConstructorType::TsFnType(ts_fn_type) => {
                            Ok(SourceMapped::new(ts_fn_type, self.source_map))
                        }
                        TsFnOrConstructorType::TsConstructorType(_) => {
                            return Err(Error::InvalidReturnType)
                        }
                    }
                }
                _ => return Err(Error::InvalidReturnType),
            },
            None => return Err(Error::MissingTypeAnnotation),
        }
    }
}

impl SourceMapped<'_, TsFnType> {
    pub fn build_act_fn_params(&self) -> Result<Vec<Param>, Vec<Error>> {
        self.params
            .iter()
            .map(|param| match param {
                TsFnParam::Ident(identifier) => {
                    let name = identifier.get_name().to_string();
                    let candid_type = match &identifier.type_ann {
                        Some(ts_type_ann) => {
                            SourceMapped::new(&ts_type_ann.get_ts_type(), self.source_map)
                                .to_candid_type()?
                        }
                        None => return Err(Error::FunctionParamsMustHaveType.into()),
                    };
                    Ok(Param { name, candid_type })
                }
                TsFnParam::Array(_) => {
                    return Err(Error::ArrayDestructuringInParamsNotSupported.into())
                }
                TsFnParam::Rest(_) => return Err(Error::RestParametersNotSupported.into()),
                TsFnParam::Object(_) => return Err(Error::ObjectDestructuringNotSupported.into()),
            })
            .collect_results()
    }
}
