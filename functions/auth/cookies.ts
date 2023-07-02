import * as cookie from "cookie";

type CookieOptions = {
  domain: string,
  httpOnly?: boolean,
  secure?: boolean,
  sameSite?: 'lax' | 'none',
  path?: string,
  maxAge?: number
}

// TODO: moved to env
export const COOKIES_GOOGLE_KEY_NAME = '__Session-worker.auth.providers-token';
export const COOKIES_PHANTOM_KEY_NAME = 'phantom::session'

export const DOMAIN_WHITELIST = ['localhost', 'develop.gist-rs.pages.dev', 'gist-rs.pages.dev']
export const COOKIES_DOMAIN = '.gist.rs'

export const get_cookies_domain_from_hostname = (hostname: string) => DOMAIN_WHITELIST.includes(hostname) ? '' : COOKIES_DOMAIN;

export const get_serialized_cookie = (key: string, value: string, options: CookieOptions) => {
  return cookie.serialize(key, value, {
    httpOnly: true,
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
    sameSite: options.domain !== '' ? 'lax' : 'none',
    ...options,
  })
}