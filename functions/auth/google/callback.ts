import jwt from '@tsndr/cloudflare-worker-jwt';
import { COOKIES_GOOGLE_KEY_NAME, get_cookies_domain_from_hostname, get_serialized_cookie } from '../cookies';
import { google } from '../../lib/cf-auth';

function generateJWT(user: any, secret: string) {
  const claims: any = {
    user_id: user?.id,
  };

  console.log("[claims, secret]", claims, secret);
  return jwt.sign({ exp: Math.floor(Date.now() / 1000) + (24 * (60 * 60)), ...claims }, secret, { algorithm: 'HS256' });
}

async function createUser(user: any) {
  const profile = {
    id: user.id,
    name: user.name,
    image: user.picture,
    email: user.email,
  };
  //@ts-ignore
  return await WORKER_AUTH_PROVIDERS_STORE.put(user.id, JSON.stringify(profile));
}

export const onRequest = async (context) => {
  const request: Request = context.request;

  try {
    // 1. Get user
    const options = {
      clientId: context.env.GOOGLE_CLIENT_ID,
      clientSecret: context.env.GOOGLE_CLIENT_SECRET,
      redirectUrl: context.env.GOOGLE_REDIRECT_DEV_URL || context.env.GOOGLE_REDIRECT_PROD_URL,
    };

    const { user: providerUser } = await google.users({
      options,
      request,
    });

    const secret = context.env.ENCODE_JWT_TOKEN;
    const jwt = await generateJWT(providerUser, secret);
    const now = new Date();
    now.setTime(now.getTime() + 24 * 3600 * 1000);

    let { origin, hostname } = new URL(request.url);
    const response = Response.redirect(`${origin}`, 301);
    const serialized_cookie = get_serialized_cookie(COOKIES_GOOGLE_KEY_NAME, jwt, { domain: get_cookies_domain_from_hostname(hostname) });
    response.headers.set('Set-Cookie', serialized_cookie);

    // 2. Init user
    // 2.1 Gen and connect email to wallet.


    // 2.2 Save to KV.
    // await createUser(providerUser);

    return response
  } catch (e) {
    console.log("[error]", e?.stack);
    return new Response(JSON.stringify(e));
  }
}
