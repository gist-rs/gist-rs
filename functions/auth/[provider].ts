
import * as bs58 from "bs58";
import * as nacl from "tweetnacl";
import * as cookie from "cookie";
import html from '../../dist/auth.html'
import { UserSessionType } from '../../model/session'

const DOMAIN_WHITELIST = ['localhost', 'develop.gist-rs.pages.dev', 'gist-rs.pages.dev']
const COOKIES_DOMAIN = '.gist.rs'
const COOKIES_PHANTOM_KEY_NAME = 'phantom::session'

export enum ProviderName {
  Phantom = "phantom"
}

// https://docs.phantom.app/solana/integrating-phantom/deeplinks-ios-and-android/handling-sessions#session-structure
const get_phantom_session_data = (session: string) => {
  const decoded_session = bs58.decode(session);
  const signature = decoded_session.slice(0, 64);
  const encoded_data = decoded_session.slice(64);
  const data_string = new TextDecoder().decode(encoded_data);
  const data = JSON.parse(data_string);

  return {
    signature,
    data
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
  // 1. Gathering params.
  const request: Request = context.request;
  const { searchParams: search_params, hostname } = new URL(request.url);
  if (!search_params) return new Response('ERROR: expect searchParams');

  const { PHANTOM_ENCRYPTION_SECRET_KEY } = await context.env;
  if (!PHANTOM_ENCRYPTION_SECRET_KEY) return new Response('ERROR: expect PHANTOM_ENCRYPTION_SECRET_KEY');

  const secret_key = new Uint8Array(bs58.decode(PHANTOM_ENCRYPTION_SECRET_KEY));
  if (!secret_key) return new Response('ERROR: expect secret_key');

  // 2. Decrypt with secret_key.
  const shared_secret_dapp = nacl.box.before(
    bs58.decode(search_params.get("phantom_encryption_public_key")!),
    secret_key
  );
  if (!shared_secret_dapp) return new Response("ERROR: expect shared secret");

  const decrypted_data = nacl.box.open.after(bs58.decode(search_params.get("data")!), bs58.decode(search_params.get("nonce")!), shared_secret_dapp);
  if (!decrypted_data) return new Response("ERROR: expect decrypted data");

  const { public_key: pubkey, session } = JSON.parse(new TextDecoder().decode(decrypted_data));
  if (!pubkey) return new Response("ERROR: expect public_key");
  if (!session) return new Response("ERROR: expect session");

  // 3. Set __SESSION__
  const { data } = get_phantom_session_data(session);
  const body = `<script>window.__SESSION__=${JSON.stringify({
    pubkey,
    phantom: { session, data }
  } as UserSessionType)}</script>`
  const response = new Response(body + html, {
    headers: { "content-type": "text/html" },
  });

  // 4. Set pubkey, session to cookie.
  const web3_token = `${pubkey}|${session}|${JSON.stringify(data)}`;
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
