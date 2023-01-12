use reqwest::Url;
use serde_json::json;
use worker::{console_log, Error, Request, Response, Result, RouteContext};

use super::guard::{extract_web3_token, Web3Token};

pub async fn handle_nft_req(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let web3_token_result = extract_web3_token(&req);

    match web3_token_result {
        Ok(web3_token) => handle_nft_web3_token(&req, &ctx, web3_token).await,
        Err(err) => Response::error(format!("${err}"), 403),
    }
}

async fn fetch(url: String) -> anyhow::Result<Result<Response>> {
    // let response = reqwest::get(url).await?;
    // let bytes = response.bytes().await?;
    // let result = Response::from_bytes(bytes.to_vec());
    // Ok(result)

    console_log!("url: {url:?}");

    let body = reqwest::get("https://arweave.net/y5e5DJsiwH0s_ayfMwYk-SnrZtVZzHLQDSTZ5dNRUHA")
        .await?
        .text()
        .await?;

    console_log!("body: {body:?}");

    let result = Response::from_html("ok");
    Ok(result)
}

fn get_query_param_value(url: &Url, key_name: &str) -> Option<String> {
    let query_params = url
        .query_pairs()
        .into_owned()
        .collect::<Vec<(String, String)>>();

    query_params
        .iter()
        .find(|x| x.0 == key_name)
        .map(|x| x.1.to_string())
}

async fn get_kv_text(ctx: &RouteContext<()>, namespace: &str, key_name: &str) -> Option<String> {
    // Some("https://arweave.net/y5e5DJsiwH0s_ayfMwYk-SnrZtVZzHLQDSTZ5dNRUHA".to_owned())
    let kv = ctx.kv(namespace);
    match kv {
        Ok(kv_store) => match kv_store.get(key_name).text().await {
            Ok(value) => value,
            Err(_) => None,
        },
        Err(_) => None,
    }
}

pub async fn handle_nft_web3_token(
    req: &Request,
    ctx: &RouteContext<()>,
    web3_token: Web3Token,
) -> Result<Response> {
    let maybe_address = ctx.param("address");
    let url = req.url().expect("ERROR: expect url");
    let maybe_chain = get_query_param_value(&url, "chain");
    let maybe_cluster = get_query_param_value(&url, "cluster");

    console_log!("handle_nft_web3_token: {maybe_chain:?}, {maybe_cluster:?}");

    let response = match maybe_address {
        Some(mint_address) => {
            // 1. Get KV
            let value: Option<String> = get_kv_text(ctx, "NFT", mint_address).await;

            let url = match value {
                Some(value) => value,
                None => return Err(Error::from("ERROR: expect value.")),
            };

            url

            // 2. Fetch content from url
            // match fetch(url).await {
            //     Ok(result) => result,
            //     Err(error) => return Err(Error::from(error.to_string())),
            // }
        }
        None => "".to_owned(),
    };

    Response::ok(response)
}
