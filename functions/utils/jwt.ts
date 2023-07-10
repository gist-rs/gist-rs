/*
 * Helpers for converting to and from URL safe Base64 strings. Needed for JWT encoding.
 */
export const base64url = {
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
export function parseJWT(token) {
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
