use handlers::{nft::handle_nft_req, proxy::handle_proxy_req, transfer::handle_transfer_req};
use worker::*;

mod handlers;
mod utils;

fn log_request(req: &Request) {
    console_log!(
        "{} - [{}], located at: {:?}, within: {}",
        Date::now().to_string(),
        req.path(),
        req.cf().coordinates().unwrap_or_default(),
        req.cf().region().unwrap_or_else(|| "unknown region".into())
    );
}

#[event(fetch)]
pub async fn main(req: Request, env: Env, _ctx: worker::Context) -> Result<Response> {
    log_request(&req);

    // Optionally, get more helpful error messages written to the console in the case of a panic.
    utils::set_panic_hook();

    // Optionally, use the Router to handle matching endpoints, use ":name" placeholders, or "*name"
    // catch-alls to match on specific patterns. Alternatively, use `Router::with_data(D)` to
    // provide arbitrary data that will be accessible in each route via the `ctx.data()` method.
    let router = Router::new();

    // Add as many routes as your Worker needs! Each route will get a `Request` for handling HTTP
    // functionality and a `RouteContext` which you can use to  and get route parameters and
    // Environment bindings like KV Stores, Durable Objects, Secrets, and Variables.
    router
        .get_async("/transfer/:command", |req, ctx| async move {
            handle_transfer_req(req, ctx).await
        })
        .get_async("/nft/:address", |req, ctx| async move {
            handle_nft_req(req, ctx).await
        })
        .get_async("/proxy/:url", |req, ctx| async move {
            handle_proxy_req(req, ctx).await
        })
        .run(req, env)
        .await
}
