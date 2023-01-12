use worker::{Error, Request, Response, Result, RouteContext};

use super::guard::{extract_web3_token, Web3Token};

pub async fn handle_nft_req(req: &Request, ctx: &RouteContext<()>) -> Result<Response> {
    let web3_token_raw = extract_web3_token(req);

    match web3_token_raw {
        Ok(web3_token_raw) => handle_nft_web3_token(&req, &ctx, web3_token_raw).await,
        Err(err) => Err(Error::from(format!("${err}"))),
    }
}

async fn fetch(url: String) -> anyhow::Result<Result<Response>> {
    let response = reqwest::get(url).await?;
    let bytes = response.bytes().await?;
    let result = Response::from_bytes(bytes.to_vec());
    Ok(result)
}

pub async fn handle_nft_web3_token(
    _req: &Request,
    ctx: &RouteContext<()>,
    web3_token: Web3Token,
) -> Result<Response> {
    let maybe_address = ctx.param("address");
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
