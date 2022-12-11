
import * as bs58 from "bs58";
import * as nacl from "tweetnacl";
import * as cookie from "cookie";

const DOMAIN_WHITED_LIST = ['localhost', 'develop.gist-rs.pages.dev', 'gist-rs.pages.dev']
const COOKIES_DOMAIN = '.gist.rs'
const COOKIES_PHANTOM_KEY_NAME = 'phantom::session'

export enum ProviderName {
  Phantom = "phantom"
}

// https://docs.phantom.app/solana/integrating-phantom/deeplinks-ios-and-android/handling-sessions#session-structure
const get_session_data = (session: string) => {
  const signature = bs58.decode(session).slice(0, 64)
  const encoded_payload = bs58.decode(session).slice(64)
  const payload = new TextDecoder().decode(encoded_payload);

  return {
    signature,
    payload
  }
}

const get_serialized_cookie = (key: string, web3_token: string, cookies_domain: string) => {
  return cookie.serialize(key, web3_token, {
    domain: cookies_domain,
    httpOnly: true,
    secure: true,
    sameSite: cookies_domain !== '' ? 'lax' : 'none',
    path: '/',
    maxAge: 60 * 60 * 1 // 1 hour
  })
}

const handle_phantom_deeplink = async (context) => {
  console.log('context:', context);
  // 1. Gathering params
  const request: Request = context.request;
  const { searchParams: search_params, hostname } = new URL(request.url);
  if (!search_params) return new Response('❌ expect searchParams');

  const { PHANTOM_ENCRYPTION_SECRET_KEY } = await context.env;
  if (!PHANTOM_ENCRYPTION_SECRET_KEY) return new Response('❌ expect PHANTOM_ENCRYPTION_SECRET_KEY');

  const secret_key = new Uint8Array(bs58.decode(PHANTOM_ENCRYPTION_SECRET_KEY));
  if (!secret_key) return new Response('❌ expect secret_key');

  // 2. Decrypt with secret_key
  const shared_secret_dapp = nacl.box.before(
    bs58.decode(search_params.get("phantom_encryption_public_key")!),
    secret_key
  );
  if (!shared_secret_dapp) return new Response("❌ expect shared secret");

  const decrypted_data = nacl.box.open.after(bs58.decode(search_params.get("data")!), bs58.decode(search_params.get("nonce")!), shared_secret_dapp);
  if (!decrypted_data) return new Response("❌ expect decrypted data");

  const { public_key, session } = JSON.parse(new TextDecoder().decode(decrypted_data));
  if (!public_key) return new Response("❌ expect public_key");
  if (!session) return new Response("❌ expect session");

  // 3. Set public_key, session to cookie
  const web3_token = `mobile::${public_key}::${session}`
  const response = new Response(`Welcome:${web3_token}`)
  const cookies_domain = DOMAIN_WHITED_LIST.includes(hostname) ? '' : COOKIES_DOMAIN
  const serialized_cookie = get_serialized_cookie(COOKIES_PHANTOM_KEY_NAME, web3_token, cookies_domain)
  response.headers.set('Set-Cookie', serialized_cookie)

  return response
}

export function onRequest(context) {
  const { provider } = context.params
  switch (provider) {
    case ProviderName.Phantom: return handle_phantom_deeplink(context)
    default: return new Response('Wat?')
  }
}
