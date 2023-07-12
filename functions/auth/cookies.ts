// import * as cookie from "cookie";
import { serialize, parse } from "cookie";

type CookieOptions = {
  domain: string,
  httpOnly?: boolean,
  secure?: boolean,
  sameSite?: 'lax' | 'none',
  path?: string,
  maxAge?: number
}

// TBD: moved to env?
export const COOKIES_PHANTOM_KEY_NAME = 'phantom::session'

export const DOMAIN_WHITELIST = ['localhost', 'develop.gist-rs.pages.dev', 'gist-rs.pages.dev']
export const COOKIES_DOMAIN = '.gist.rs'

export const get_cookies_domain_from_hostname = (hostname: string) => DOMAIN_WHITELIST.includes(hostname) ? '' : COOKIES_DOMAIN;

export const get_serialized_cookie = (key: string, value: string, options: CookieOptions) => {
  return serialize(key, value, {
    httpOnly: true,
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
    sameSite: options.domain !== '' ? 'lax' : 'none',
    ...options,
  })
}

export const get_cookie_from_request = (request: Request, cookie_name: string) => {
  const cookie = parse(request.headers.get("Cookie") || "");
  return cookie[cookie_name]
}