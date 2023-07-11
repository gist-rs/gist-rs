import jwt from '@tsndr/cloudflare-worker-jwt';
import { COOKIES_GOOGLE_KEY_NAME, get_cookie_from_request, get_cookies_domain_from_hostname, get_serialized_cookie } from '../auth/cookies';
import { UserInfo } from "./user";
import { parseJWT } from '../utils/jwt';

export function generateJWT(user: UserInfo, secret: string) {
  return jwt.sign({ exp: Math.floor(Date.now() / 1000) + (24 * (60 * 60)), ...user }, secret, { algorithm: 'HS256' });
}

export async function get_user_cookie(user_info: UserInfo, hostname: string, secret: string) {
  const jwt = await generateJWT(user_info, secret);
  const now = new Date();
  now.setTime(now.getTime() + 24 * 3600 * 1000);
  return get_serialized_cookie(COOKIES_GOOGLE_KEY_NAME, jwt, { domain: get_cookies_domain_from_hostname(hostname) });
}

export async function new_response_with_user_cookie(response: Response, user_info: UserInfo, hostname: string, secret: string) {
  let new_response = new Response(response.body, response);
  const user_session_cookie = await get_user_cookie(user_info, hostname, secret)
  new_response.headers.set('Set-Cookie', user_session_cookie);

  return new_response
}
export async function get_user_info_from_request_cookie(request: Request) {
  const idToken = get_cookie_from_request(request, COOKIES_GOOGLE_KEY_NAME)
  const jwt = parseJWT(idToken)
  const { payload } = jwt

  return payload as UserInfo
}