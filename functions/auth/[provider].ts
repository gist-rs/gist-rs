
import * as bs58 from "bs58";
import * as nacl from "tweetnacl";
import * as cookie from "cookie";
import html from '../../dist/auth.html'

const DOMAIN_WHITELIST = ['localhost', 'develop.gist-rs.pages.dev', 'gist-rs.pages.dev']
const COOKIES_DOMAIN = '.gist.rs'
const COOKIES_PHANTOM_KEY_NAME = 'phantom::session'

export enum ProviderName {
  Phantom = "phantom"
}

// https://docs.phantom.app/solana/integrating-phantom/deeplinks-ios-and-android/handling-sessions#session-structure
const get_session_data = (session: string) => {
  const encoded_payload = bs58.decode(session).slice(64);
  const payload_string = new TextDecoder().decode(encoded_payload);
  const payload = JSON.parse(payload_string);

  return {
    session,
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
  // 1. Gathering params.
  const request: Request = context.request;
  const { searchParams: search_params, hostname } = new URL(request.url);
  if (!search_params) return new Response('❌ expect searchParams');

  const { PHANTOM_ENCRYPTION_SECRET_KEY } = await context.env;
  if (!PHANTOM_ENCRYPTION_SECRET_KEY) return new Response('❌ expect PHANTOM_ENCRYPTION_SECRET_KEY');

  const secret_key = new Uint8Array(bs58.decode(PHANTOM_ENCRYPTION_SECRET_KEY));
  if (!secret_key) return new Response('❌ expect secret_key');

  // 2. Decrypt with secret_key.
  const shared_secret_dapp = nacl.box.before(
    bs58.decode(search_params.get("phantom_encryption_public_key")!),
    secret_key
  );
  if (!shared_secret_dapp) return new Response("❌ expect shared secret");

  const decrypted_data = nacl.box.open.after(bs58.decode(search_params.get("data")!), bs58.decode(search_params.get("nonce")!), shared_secret_dapp);
  if (!decrypted_data) return new Response("❌ expect decrypted data");

  const { public_key: pubkey, session } = JSON.parse(new TextDecoder().decode(decrypted_data));
  if (!pubkey) return new Response("❌ expect public_key");
  if (!session) return new Response("❌ expect session");

  // 3. Set __SESSION__
  const session_data = get_session_data(session);
  const body = `<script>window.__SESSION__=${JSON.stringify({ pubkey, ...session_data })}</script>`
  const response = new Response(body + html, {
    headers: { "content-type": "text/html" },
  });

  // 4. Set pubkey, session to cookie.
  const web3_token = `mobile::${pubkey}::${session}`;
  const cookies_domain = DOMAIN_WHITELIST.includes(hostname) ? '' : COOKIES_DOMAIN;
  const serialized_cookie = get_serialized_cookie(COOKIES_PHANTOM_KEY_NAME, web3_token, cookies_domain);
  response.headers.set('Set-Cookie', serialized_cookie);

  return response
}

export const onRequestGet: PagesFunction<unknown, "provider"> = (context) => {
  const { provider } = context.params
  switch (provider) {
    case ProviderName.Phantom: return handle_phantom_deeplink(context)
    default: return new Response('Wat?')
  }
}
