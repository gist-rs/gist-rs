use handlers::{nft::handle_nft_req, transfer::handle_transfer_req};
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
        // POC
        .post_async("/kv", |_req, ctx| async move {
            let kv = ctx.kv("gist::content")?;

            kv.put(
                "A2NzysADP3a6FzgKkh4dzQbwK6CgsJcdo3Rz6opfFMPy",
                "https://arweave.net/y5e5DJsiwH0s_ayfMwYk-SnrZtVZzHLQDSTZ5dNRUHA",
            )?
            .execute()
            .await?;
            let url = kv
                .get("A2NzysADP3a6FzgKkh4dzQbwK6CgsJcdo3Rz6opfFMPy")
                .text()
                .await?
                .ok_or_else(|| "ERROR: Not exist".to_owned())?;

            Response::ok(url)
        })
        // .get("/", |_, _| Response::ok("Hello from Workers!"))
        // .post_async("/form/:field", |mut req, ctx| async move {
        //     if let Some(name) = ctx.param("field") {
        //         let form = req.form_data().await?;
        //         match form.get(name) {
        //             Some(FormEntry::Field(value)) => {
        //                 return Response::from_json(&json!({ name: value }))
        //             }
        //             Some(FormEntry::File(_)) => {
        //                 return Response::error("`field` param in form shouldn't be a File", 422);
        //             }
        //             None => return Response::error("Bad Request", 400),
        //         }
        //     }
        //     Response::error("Bad Request", 400)
        // })
        // .get("/worker-version", |_, ctx| {
        //     let version = ctx.var("WORKERS_RS_VERSION")?.to_string();
        //     Response::ok(version)
        // })
        .run(req, env)
        .await
}
