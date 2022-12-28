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

pub async fn handle_transfer_req(req: Request, ctx: RouteContext<()>) -> Result<Response> {
    let maybe_cookie_string = req.headers().get_some("Cookie");
    let maybe_command = ctx.param("command");

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
                    let pubkey_session = cookie_str.split("::").collect::<Vec<_>>();
                    let target = pubkey_session[0];
                    let user_pubkey_str = pubkey_session[1];
                    let session_str = pubkey_session[2];

                    console_log!("target:{:#?}", target);
                    console_log!("user_pubkey:{:#?}", user_pubkey_str);
                    console_log!("session_str:{:#?}", session_str);

                    Response::ok(format!(
                        "target:{target:#?},user_pubkey_str:{user_pubkey_str:#?},session_str:{session_str:#?}"
                    ))
                }
                None => Response::ok("❌ expect session."),
            }
        }
        None => Response::ok("❌ expect cookie."),
    }
}
