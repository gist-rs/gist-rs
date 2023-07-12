import jwt from '@tsndr/cloudflare-worker-jwt';
import { get_cookie_from_request, get_cookies_domain_from_hostname, get_serialized_cookie } from '../auth/cookies';
import { parseJWT } from '../utils/jwt';

export function generateJWT(data: Object, secret: string) {
  return jwt.sign({ exp: Math.floor(Date.now() / 1000) + (24 * (60 * 60)), ...data }, secret, { algorithm: 'HS256' });
}

export async function get_user_cookie(data: Object, hostname: string, secret: string, cookie_name: string) {
  const jwt = await generateJWT(data, secret);
  const now = new Date();
  now.setTime(now.getTime() + 24 * 3600 * 1000);
  return get_serialized_cookie(cookie_name, jwt, { domain: get_cookies_domain_from_hostname(hostname) });
}

export async function new_response_with_user_cookie(response: Response, data: Object, hostname: string, secret: string, cookie_name: string) {
  let new_response = new Response(response.body, response);
  const user_session_cookie = await get_user_cookie(data, hostname, secret, cookie_name)
  new_response.headers.set('Set-Cookie', user_session_cookie);

  return new_response
}

export async function get_cookie_payload_from_request(request: Request, cookie_name: string) {
  const idToken = get_cookie_from_request(request, cookie_name)
  const jwt = parseJWT(idToken)
  const { payload } = jwt

  return payload
}