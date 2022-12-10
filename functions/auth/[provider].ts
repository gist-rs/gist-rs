
import * as bs58 from "bs58";
import * as nacl from "tweetnacl";
import * as cookie from "cookie";

const COOKIES_DOMAIN = '.gist.rs'
export enum ProviderName {
  Phantom = "phantom"
}

const decryptPayload = (data: string, nonce: string, sharedSecret: Uint8Array) => {
  if (!sharedSecret) throw new Error("missing shared secret");

  const decryptedData = nacl.box.open.after(bs58.decode(data), bs58.decode(nonce), sharedSecret);
  if (!decryptedData) {
    throw new Error("Unable to decrypt data");
  }
  const payload = new TextDecoder().decode(decryptedData);
  return JSON.parse(payload);
};

const get_cookie_web3_token = (web3_token: string, cookies_domain: string) => {
  return cookie.serialize('web3_token', web3_token, {
    domain: cookies_domain,
    httpOnly: true,
    secure: true,
    sameSite: cookies_domain !== '' ? 'lax' : 'none',
    path: '/',
    maxAge: 60 * 60 * 1 // 1 hour
  })
}

const handle_phantom_deeplink = async (context) => {
  console.log('context:', context)
  const request: Request = context.request;
  const { searchParams, hostname } = new URL(request.url)

  const PHANTOM_ENCRYPTION_SECRET_KEY = await context.env.PHANTOM_ENCRYPTION_SECRET_KEY
  const secret_key = new Uint8Array(bs58.decode(PHANTOM_ENCRYPTION_SECRET_KEY));
  const sharedSecretDapp = nacl.box.before(
    bs58.decode(searchParams.get("phantom_encryption_public_key")!),
    secret_key
  );

  const connectData = decryptPayload(
    searchParams.get("data")!,
    searchParams.get("nonce")!,
    sharedSecretDapp
  );

  const response = new Response(`Welcome:${JSON.stringify(connectData, null, 2)}`)
  const web3_token = `${connectData.public_key},${connectData.session}`
  const cookies_domain = ['localhost'].includes(hostname) ? '' : COOKIES_DOMAIN
  const cookie_web3_token = get_cookie_web3_token(web3_token, cookies_domain)
  response.headers.set('Set-Cookie', cookie_web3_token)

  return response
}

export function onRequest(context) {
  const { provider } = context.params
  switch (provider) {
    case ProviderName.Phantom: return handle_phantom_deeplink(context)
    default: return new Response('Wat?')
  }
}
