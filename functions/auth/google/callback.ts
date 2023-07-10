import jwt from '@tsndr/cloudflare-worker-jwt';
import { COOKIES_GOOGLE_KEY_NAME, get_cookies_domain_from_hostname, get_serialized_cookie } from '../cookies';
import { google } from '../../lib/cf-auth';
import { parse } from "cookie";

/*
 * Helpers for converting to and from URL safe Base64 strings. Needed for JWT encoding.
 */
const base64url = {
  stringify: function (a) {
    let base64string = btoa(String.fromCharCode.apply(0, a))
    return base64string
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
  },
  parse: function (s) {
    s = s
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .replace(/\s/g, '')
    return new Uint8Array(
      Array.prototype.map.call(atob(s), function (c) {
        return c.charCodeAt(0)
      }),
    )
  },
}

/**
 * Parse a JWT into its respective pieces. Does not do any validation other than form checking.
 * @param {*} token - jwt string
 * @returns
 */
function parseJWT(token) {
  const tokenParts = token.split('.')

  if (tokenParts.length !== 3) {
    throw new Error('token must have 3 parts')
  }

  let enc = new TextDecoder('utf-8')
  return {
    to_be_validated: `${tokenParts[0]}.${tokenParts[1]}`,
    header: JSON.parse(enc.decode(base64url.parse(tokenParts[0]))),
    payload: JSON.parse(enc.decode(base64url.parse(tokenParts[1]))),
    signature: tokenParts[2],
  }
}

export const getTokenInfo = async (idToken: string): Promise<any> => {
  const result = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`, {
    headers: {
      "content-type": "application/json",
    },
    method: "GET"
  });

  const json = await result.json()
  return json
}

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

// TODO: deprecated code flow and use only onRequestPost?
export const onRequest = async (context) => {
  const request: Request = context.request;

  try {
    // 1. Get user
    const options = {
      clientId: context.env.GOOGLE_CLIENT_ID,
      clientSecret: context.env.GOOGLE_CLIENT_SECRET,
      redirectUrl: context.env.GOOGLE_REDIRECT_URL,
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

    // Clone the response so that it's no longer immutable
    const newResponse = new Response(response.body, response);

    const serialized_cookie = get_serialized_cookie(COOKIES_GOOGLE_KEY_NAME, jwt, { domain: get_cookies_domain_from_hostname(hostname) });
    newResponse.headers.set('Set-Cookie', serialized_cookie);

    // 2. Init user
    // 2.1 Gen and connect email to wallet.


    // 2.2 Save to KV.
    // await createUser(providerUser);

    return newResponse
  } catch (e) {
    console.log("[error]", e?.stack);
    return new Response(JSON.stringify(e));
  }
}

// ref: https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
export const onRequestPost: PagesFunction<unknown, "provider"> = async (context) => {
  const COOKIE_NAME = 'g_csrf_token'
  const CREDENTIAL = 'credential'

  const { request } = context
  const cookie = parse(request.headers.get("Cookie") || "");

  const csrf_token_cookie = cookie[COOKIE_NAME]
  if (!csrf_token_cookie) return new Response('No CSRF token in Cookie.', { status: 400 })

  const formData = await request.formData()
  const csrf_token_body = formData.get(COOKIE_NAME)
  if (!csrf_token_body) return new Response('No CSRF token in post body.', { status: 400 })

  if (csrf_token_cookie !== csrf_token_body)
    return new Response('Failed to verify double submit cookie.', { status: 400 })


  const idToken = formData.get(CREDENTIAL)
  if (!idToken) return new Response('No idToken in post body.', { status: 400 })

  // Validate idToken.
  const jwt = parseJWT(idToken)
  const claims = jwt.payload
  console.log(JSON.stringify(claims, null, 2))
  let now = Math.floor(Date.now() / 1000)

  // 1. Validate expiration.
  if (claims.exp < now) {
    throw new Error('expired token')
  }

  // 2. Validate idToken.
  const token_info = await getTokenInfo(idToken);
  if (!token_info) return new Response('Invalid idToken.', { status: 400 })

  // 3. Expected same aud
  if (token_info.aud !== claims.aud) return new Response('Invalid aud.', { status: 400 })

  // 4. Expected iss to be accounts.google.com
  if (token_info.iss !== "https://accounts.google.com") return new Response('Invalid aud.', { status: 400 })

  return new Response(JSON.stringify(token_info, null, 2))
}
