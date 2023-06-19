use std::str::FromStr;

use serde::{Deserialize, Serialize};
use serde_qs;
use solana_web3_wasm::solana_sdk::pubkey::Pubkey;
use worker::{Request, Response, Result, RouteContext, Url};

#[derive(Debug, Serialize, Deserialize)]
struct PayQueryParams {
    amount: u32,
    #[serde(rename = "spl-token")]
    spl_token: String,
    reference: String,
    label: String,
    message: String,
    memo: String,
}

struct PayCommand {
    chain_type: String,
    recipient: String,
}

pub async fn handle_pay_req(req: Request, _ctx: RouteContext<()>) -> Result<Response> {
    // command // solana:recipient
    let pay_command = match _ctx.param("command") {
        Some(command) => {
            let mut parts = command.split(':');
            let chain_type = match parts.next() {
                Some(chain_type) => chain_type.to_owned(),
                None => {
                    return Response::error("Expected valid command chain_type".to_string(), 401)
                }
            };
            let recipient = match parts.next() {
                Some(recipient) => recipient.to_owned(),
                None => {
                    return Response::error("Expected valid command recipient".to_string(), 401)
                }
            };

            PayCommand {
                chain_type,
                recipient,
            }
        }
        None => return Response::error("Expected url params".to_string(), 401),
    };

    // search_params // ?amount=0.01&spl-token=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
    let url = match req.url() {
        Ok(url) => url,
        Err(_) => return Response::error("Expected valid query".to_string(), 401),
    };

    let query_result = match url.query() {
        Some(query) => serde_qs::from_str::<PayQueryParams>(query),
        None => return Response::error("Expected valid query".to_string(), 401),
    };

    let pay_query_params = match query_result {
        Ok(query) => query,
        Err(_) => return Response::error("Expected valid query result".to_string(), 401),
    };

    // TODO: use file_hash as reference
    // TODO: use server_id as memo

    // TODO: watch for 30secs
    // TODO: get_signatures_for_address

    let chain_type = pay_command.chain_type;
    let recipient = pay_command.recipient;

    let url = match Url::from_str(
        format!("{chain_type}:{recipient}?amount=0.01&spl-token=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v")
            .as_str(),
    ) {
        Ok(url) => url,
        Err(_) => return Response::error("Expected valid url".to_string(), 401),
    };

    Response::redirect(url)
}
