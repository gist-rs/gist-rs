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

const PHANTOM_SESSION_KEY_NAME: &str = "phantom::session";
const PHANTOM_ENCRYPTION_PUBLIC_KEY_KEY_NAME: &str = "PHANTOM_ENCRYPTION_PUBLIC_KEY";

pub async fn handle_transfer_req(req: Request, ctx: RouteContext<()>) -> Result<Response> {
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
                    let cookie_str = cookie.value();
                    let pubkey_session = cookie_str.split("::").collect::<Vec<_>>();
                    let target = pubkey_session[0];
                    let user_pubkey_str = pubkey_session[1];
                    let session_str = pubkey_session[2];

                    console_log!("target:{:#?}", target);
                    console_log!("user_pubkey:{:#?}", user_pubkey_str);
                    console_log!("session:{:#?}", session_str);

                    // let session_bytes = bs58::decode(session_str)
                    //     .into_vec()
                    //     .expect("❌ expect session str.");

                    // let pubkey_string = ctx
                    //     .env
                    //     .var(PHANTOM_ENCRYPTION_PUBLIC_KEY_KEY_NAME)?
                    //     .to_string();
                    // let pubkey_bytes = bs58::decode(pubkey_string)
                    //     .into_vec()
                    //     .expect("❌ expect pk.");

                    // let verified_session_data = nacl::sign::open(&signature_bytes, &pubkey_bytes)
                    //     .expect("❌ expect verified session.");

                    // let session_data = str::from_utf8(&verified_session_data).unwrap_or("None");

                    Response::ok(format!(
                        "target:{:#?},user_pubkey_str:{:#?},session_str:{:#?}",
                        target, user_pubkey_str, session_str
                    ))
                }
                None => Response::ok("❌ expect session."),
            }
        }
        None => Response::ok("❌ expect cookie."),
    }
}
