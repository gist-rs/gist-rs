use cookie::Cookie;
use std::str;
use worker::{console_log, Headers, Request, Response, Result, RouteContext};

trait Maybe {
    fn get_some(&self, key: &str) -> Option<String>;
}

impl Maybe for Headers {
    fn get_some(&self, key: &str) -> Option<String> {
        self.get(key).ok().unwrap_or(None)
    }
}

pub const PHANTOM_SESSION_KEY_NAME: &str = "phantom::session";

#[derive(Debug)]
pub struct Web3TokenRaw {
    user_pubkey: String,
    session: String,
    data: String,
}

pub fn handle_web3_req(
    req: Request,
    ctx: RouteContext<()>,
    callback: fn(req: Request, ctx: RouteContext<()>, web3_token: Web3TokenRaw) -> Result<Response>,
) -> Result<Response> {
    let maybe_cookie_string = req.headers().get_some("Cookie");

    match maybe_cookie_string {
        Some(cookie_string) => {
            let mut cookies = cookie_string
                .split(';')
                .map(|s| s.trim())
                .filter(|s| !s.is_empty())
                .flat_map(Cookie::parse_encoded);
            let maybe_cookie = cookies.find(|e| e.name() == PHANTOM_SESSION_KEY_NAME);

            match maybe_cookie {
                Some(cookie) => {
                    // 1. Dynamic input.
                    let cookie_str = cookie.value();
                    let pubkey_session = cookie_str.split("|").collect::<Vec<_>>();
                    let user_pubkey = pubkey_session[0].to_owned();
                    let session = pubkey_session[1].to_owned();
                    let data = pubkey_session[2].to_owned();

                    let response_result = callback(
                        req,
                        ctx,
                        Web3TokenRaw {
                            user_pubkey,
                            session,
                            data,
                        },
                    );

                    match response_result {
                        Ok(response) => Ok(response),
                        Err(error) => return Response::ok(format!("❌ error: {error:?}.")),
                    }
                }
                None => Response::ok("❌ expect session."),
            }
        }
        None => Response::ok("❌ expect cookie."),
    }
}
