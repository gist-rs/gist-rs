
import * as bs58 from "bs58";
// @ts-ignore
import nacl from "tweetnacl";

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

const handle_phantom_deeplink = async (context, searchParams: URLSearchParams) => {
  // console.log('context:', context)
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

  return new Response(`Welcome:${JSON.stringify(connectData, null, 2)}`)
}

export function onRequest(context) {
  const request: Request = context.request;
  const { searchParams } = new URL(request.url)
  const { provider } = context.params

  switch (provider) {
    case ProviderName.Phantom: return handle_phantom_deeplink(context, searchParams)
    default: return new Response('Wat?')
  }
}
