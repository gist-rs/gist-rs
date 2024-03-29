use worker::*;

pub async fn fetch_json(url: &str) -> anyhow::Result<serde_json::Value> {
    Ok(reqwest::get(url).await?.json().await?)
}

pub async fn handle_proxy_req(_req: Request, _ctx: RouteContext<()>) -> Result<Response> {
    let url = _ctx.params.url;// "https://raw.githubusercontent.com/gist-rs/book/main/examples/r4/20-fetch-json-reqwest/src/foo.json";
    let json_result = fetch_json(url).await;

    match json_result {
        Ok(value) => Response::ok(value.to_string()),
        Err(err) => Response::error(format!("${err}"), 500),
    }
}
