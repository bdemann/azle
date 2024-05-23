// TODO how do we deal with multiple instances of open_value_sharing_periodic_payment existing?
// TODO right now for example, azle automatically pulls it in
// TODO I suppose the CDK would need to do this?
// TODO maybe it could do it itself if it could check if
// TODO the method already exists in the canister?

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct ConsumerConfig {
    #[serde(rename = "periodicPaymentPercentage")]
    pub periodic_payment_percentage: u32,
    #[serde(rename = "periodHours")]
    pub period_hours: u32,
    #[serde(rename = "dependencyInfos")]
    pub dependency_infos: Vec<DependencyInfo>,
    #[serde(rename = "depthWeights")]
    pub depth_weights: DepthWeights,
}

type DepthWeights = std::collections::HashMap<u32, u32>;

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct DependencyInfo {
    pub name: String,
    pub depth: u32,
    pub weight: u32,
    pub platform: String,
    pub asset: String,
    #[serde(rename = "paymentMechanism")]
    pub payment_mechanism: String,
    pub custom: std::collections::HashMap<String, serde_json::Value>,
}

// TODO we should probably keep a log of payments right?
// TODO so that devs can check that it's been done correctly?
// TODO do we need error handling??
// TODO it is much more scalable without error handling
// TODO also it's quick and nimble if it's just best effort
// TODO we can also just spawn off timers until they are all done
// TODO we need some way to store state...across upgrades
// TODO the timer always needs to be set across upgrades
// TODO notify runs out after 500 because of the canister outgoing queue
// TODO calling wallet_receive seems to have no limit, takes few cycles, at least within the same subnet
// TODO management canister, which might be across subnets as an emulation, takes the longest
// TODO not sure if there's any practical limit though

// TODO implement the optional stuff from ConsumerConfig
// TODO figure out how to get this to work on mainnet and locally well
pub async fn open_value_sharing_periodic_payment(consumer_config: &ConsumerConfig) {
    ic_cdk::println!("open_value_sharing_periodic_payment");

    let total_periodic_payment_amount = calculate_total_periodic_payment_amount().await;

    ic_cdk::println!(
        "total_periodic_payment_amount: {}",
        total_periodic_payment_amount
    );

    for dependency_info in &consumer_config.dependency_infos {
        ic_cdk::println!("dependency_info: {:#?}", dependency_info);

        let dependency_periodic_payment_amount = calculate_dependency_periodic_payment_amount(
            dependency_info,
            &consumer_config.depth_weights,
            total_periodic_payment_amount,
            dependency_info.depth == (consumer_config.dependency_infos.len() - 1) as u32,
        );

        if dependency_info.platform == "icp" {
            handle_icp_platform(&dependency_info, dependency_periodic_payment_amount).await;
        }
    }
}

// TODO do all of the balance and previous calculation stuff here
async fn calculate_total_periodic_payment_amount() -> u128 {
    1_000_000
}

// TODO we also need to take into account the total number of levels
// TODO for example if there is only one level you don't need to cut anything in half
// TODO double-check the weight calculation
fn calculate_dependency_periodic_payment_amount(
    dependency_info: &DependencyInfo,
    depth_weights: &DepthWeights,
    total_periodic_payment_amount: u128,
    bottom: bool,
) -> u128 {
    let adjusted_depth = dependency_info.depth + if bottom { 0 } else { 1 };

    let dependency_level_periodic_payment_amount =
        total_periodic_payment_amount / 2_u128.pow(adjusted_depth as u32);

    ic_cdk::println!(
        "dependency_level_periodic_payment_amount: {}",
        dependency_level_periodic_payment_amount
    );

    let total_dependency_level_weight = *depth_weights.get(&dependency_info.depth).unwrap();

    let dependency_ratio = dependency_info.weight as f64 / total_dependency_level_weight as f64;

    (dependency_level_periodic_payment_amount as f64 * dependency_ratio) as u128
}

async fn handle_icp_platform(dependency_info: &DependencyInfo, payment_amount: u128) {
    if dependency_info.asset == "cycles" {
        handle_icp_platform_asset_cycles(dependency_info, payment_amount).await;
    }
}

async fn handle_icp_platform_asset_cycles(dependency_info: &DependencyInfo, payment_amount: u128) {
    let principal_string = dependency_info
        .custom
        .get("principal")
        .unwrap()
        .as_str()
        .unwrap()
        .to_string();
    let principal = candid::Principal::from_text(principal_string).unwrap();

    if dependency_info.payment_mechanism == "wallet" {
        ic_cdk::println!("wallet");

        ic_cdk::api::call::call_with_payment128::<(Option<()>,), ()>(
            principal,
            "wallet_receive",
            (None,),
            payment_amount,
        ) // TODO do we need to specify None?
        .await
        .unwrap();
    }

    if dependency_info.payment_mechanism == "deposit" {
        ic_cdk::println!("deposit");

        ic_cdk::api::management_canister::main::deposit_cycles(
            ic_cdk::api::management_canister::main::CanisterIdRecord {
                canister_id: principal,
            },
            payment_amount,
        )
        .await
        .unwrap();
    }

    ic_cdk::println!("successfully sent {} cycles\n\n", payment_amount);

    // TODO add ledger

    // TODO should we error out or just log if this is not supported?
    // ic_cdk::println!(
    //     "payment_mechanism \"{}\" is not supported",
    //     dependency.payment_mechanism
    // );
}
