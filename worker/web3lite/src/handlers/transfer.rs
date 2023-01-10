use worker::{Request, Response, Result, RouteContext};

use super::guard::{handle_web3_req, Web3TokenRaw};

pub async fn handle_transfer_req(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    handle_web3_req(req, ctx, handle_transfer_web3_token)
}

pub fn handle_transfer_web3_token(
    _req: Request,
    ctx: RouteContext<()>,
    web3_token: Web3TokenRaw,
) -> Result<Response> {
    let maybe_command = ctx.param("command");
    Response::ok(format!(
        "web3_token:{web3_token:#?}, maybe_address:{maybe_command:?}, web3_token: {web3_token:?}"
    ))
}
