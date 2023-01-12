use cookie::Cookie;
use serde::{Deserialize, Serialize};
use std::str;
use worker::{Headers, Request};

trait Maybe {
    fn get_some(&self, key: &str) -> Option<String>;
}

impl Maybe for Headers {
    fn get_some(&self, key: &str) -> Option<String> {
        self.get(key).ok().unwrap_or(None)
    }
}

pub const PHANTOM_SESSION_KEY_NAME: &str = "phantom::session";

#[derive(Serialize, Deserialize, Debug)]
pub struct Web3Token {
    wallet_address: String,
    phantom: PhantomMobile,
}
#[derive(Serialize, Deserialize, Debug)]

struct PhantomMobile {
    session: String,
    data: PhantomConnectionData,
}
#[derive(Serialize, Deserialize, Debug)]
struct PhantomConnectionData {
    app_url: String,
    timestamp: i64,
    chain: String,
    cluster: String,
}

pub fn extract_web3_token(req: Request) -> anyhow::Result<Web3Token> {
    let cookie_string = req
        .headers()
        .get_some("Cookie")
        .expect("ERROR: expect cookie.");

    let mut cookies = cookie_string
        .split(';')
        .map(|s| s.trim())
        .filter(|s| !s.is_empty())
        .flat_map(Cookie::parse_encoded);

    let cookie = cookies
        .find(|e| e.name() == PHANTOM_SESSION_KEY_NAME)
        .expect("ERROR: expect session.");

    // 1. Dynamic input.
    let cookie_str = cookie.value();
    let pubkey_session = cookie_str.split('|').collect::<Vec<_>>();
    let user_pubkey = pubkey_session[0].to_owned();
    let session = pubkey_session[1].to_owned();
    let data_string = pubkey_session[2].to_owned();
    let data = serde_json::from_str(data_string.as_str())?;

    Ok(Web3Token {
        wallet_address: user_pubkey,
        phantom: PhantomMobile { session, data },
    })
}
