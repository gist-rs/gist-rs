import { parse } from "cookie";
import { getUser } from "../lib/cf-auth/providers/google/users";

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

// /*
//  * Helper to get from an ascii string to a literal byte array.
//  * Necessary to get ascii string prepped for base 64 encoding
//  */
// function asciiToUint8Array(str) {
//   let chars = []
//   for (let i = 0; i < str.length; ++i) {
//     chars.push(str.charCodeAt(i))
//   }
//   return new Uint8Array(chars)
// }

// export const getAccountInfo = async (apiKey: string, idToken: string) => {
//   const payload = { idToken }
//   const result = await fetch(`https://www.googleapis.com/identitytoolkit/v3/relyingparty/getAccountInfo?key=${apiKey}`, {
//     headers: {
//       "content-type": "application/json",
//     },
//     body: JSON.stringify(payload),
//     method: "POST"
//   });

//   const json = await result.json()
//   return json
// }

// /**
//  * Validates the provided token using the Access public key set
//  *
//  * @param token - the token to be validated
//  * @returns {object} Returns the payload if valid, or throws an error if not
//  */
// async function verifyToken(api_key, token) {
//   const jwt = parseJWT(token)
//   // const key = await fetchAccessPublicKey(jwt.header.kid)

//   // const verified = await crypto.subtle.verify(
//   //   'RSASSA-PKCS1-v1_5',
//   //   key,
//   //   base64url.parse(jwt.signature),
//   //   asciiToUint8Array(jwt.to_be_validated),
//   // )

//   const verified = await getAccountInfo(api_key, token)
//   console.log('verified:', verified)

//   if (!verified) {
//     throw new Error('failed to verify token')
//   }

//   const claims = jwt.payload
//   let now = Math.floor(Date.now() / 1000)
//   // Validate expiration
//   if (claims.exp < now) {
//     throw new Error('expired token')
//   }

//   return claims
// }

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
  // return new Response(`${idToken}`)
  console.log('---------------')
  console.log(idToken)
  console.log('---------------')

  // Didn't work UNAUTHENTICATED, because this is not access_token but idToken.
  // const providerUser = await getUser(idToken);
  // if (!providerUser) return new Response('Invalid accessToken.', { status: 400 })

  // Didn't work INVALID_ID_TOKEN
  // const foo = await verifyToken(context.env.IDP_API_KEY, idToken)


  const jwt = parseJWT(idToken)
  const claims = jwt.payload
  let now = Math.floor(Date.now() / 1000)
  // Validate expiration
  if (claims.exp < now) {
    throw new Error('expired token')
  }

  return new Response(`Hello ${JSON.stringify(claims)}`)
}
