use reqwest::Url;
use worker::{console_log, Error, Request, Response, Result, RouteContext};

use super::guard::{extract_web3_token, Web3Token};

pub async fn handle_nft_req(req: &Request, ctx: &RouteContext<()>) -> Result<Response> {
    let web3_token_result = extract_web3_token(req);

    match web3_token_result {
        Ok(web3_token) => handle_nft_web3_token(&req, &ctx, web3_token).await,
        Err(err) => Err(Error::from(format!("${err}"))),
    }
}

async fn fetch(url: String) -> anyhow::Result<Result<Response>> {
    let response = reqwest::get(url).await?;
    let bytes = response.bytes().await?;
    let result = Response::from_bytes(bytes.to_vec());
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

pub async fn handle_nft_web3_token(
    req: &Request,
    ctx: &RouteContext<()>,
    web3_token: Web3Token,
) -> Result<Response> {
    let maybe_address = ctx.param("address");
    let url = req.url().expect("ERROR: expect url");
    let maybe_chain = get_query_param_value(&url, "chain");

    console_log!("handle_nft_web3_token: {maybe_chain:?}");

    let response = match maybe_address {
        Some(mint_address) => {
            // 1. Get KV
            let kv = ctx.kv("gist::solana::devnet").expect("ERROR: expect KV.");
            let url = kv
                .get(mint_address)
                .text()
                .await
                .expect("ERROR: result.")
                .expect("ERROR: expect url.");

            // 2. Fetch content from url
            fetch(url).await.expect("ERROR: expect content.")
        }
        None => Response::ok("ERROR: expect address."),
    };

    response.map_err(Error::from)
}
