
import { parse } from "cookie";
import { google } from '../../lib/cf-auth';
import { parseJWT } from '../../utils/jwt';
import { new_response_with_user_cookie } from "../jwt";

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

export type UserInfo = {
  name: string
  image: string
  email: string
}

// TODO: use this with discord and else 
export const onRequest = async (context) => {
  try {
    throw new Error('Not implemented.')
    const responder = new OAuthResponder(context)
    return responder.get_response()
  } catch (e) {
    console.log("[error]", e?.stack);
    return new Response(JSON.stringify(e));
  }
}

// ref: https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
export const onRequestPost: PagesFunction<unknown, "provider"> = async (context) => {
  try {
    // User
    const user_info = await extract_user_info(context.request)

    // TBD: redirect by member_info state.
    const url = new URL(context.request.url)
    let response = Response.redirect(url.origin, 301);
    let new_response = await new_response_with_user_cookie(response, user_info, url.hostname, (context.env as any).ENCODE_JWT_TOKEN)

    return new_response
  } catch (e) {
    console.log("[error]", e?.stack);
    return new Response(JSON.stringify(e));
  }
}

class OAuthResponder {
  context: EventContext<unknown, "provider", Record<string, unknown>>
  request: Request
  response: Response
  self: OAuthResponder

  constructor(context: EventContext<unknown, "provider", Record<string, unknown>>) {
    this.context = context
    const { request } = this.context
    this.request = request
    this.self = this

    return this
  }

  get_response() { return this.response }

  async extract_user_info() {
    // 1. Get user
    const options = {
      // @ts-ignore
      clientId: this.context.env.GOOGLE_CLIENT_ID,
      // @ts-ignore
      clientSecret: this.context.env.GOOGLE_CLIENT_SECRET,
      // @ts-ignore
      redirectUrl: this.context.env.GOOGLE_REDIRECT_URL,
    };

    const { request } = this
    const { user: providerUser } = await google.users({
      options,
      request,
    });

    return {
      email: providerUser.email,
      name: providerUser.name,
      image: providerUser.picture,
    } as UserInfo
  }
}

async function extract_user_info(request: Request) {
  const COOKIE_NAME = 'g_csrf_token'
  const CREDENTIAL = 'credential'

  const cookie = parse(request.headers.get("Cookie") || "");

  const csrf_token_cookie = cookie[COOKIE_NAME]
  if (!csrf_token_cookie) throw new Error('No CSRF token in Cookie.')

  const formData = await request.formData()
  const csrf_token_body = formData.get(COOKIE_NAME)
  if (!csrf_token_body) throw new Error('No CSRF token in post body.')

  if (csrf_token_cookie !== csrf_token_body)
    throw new Error('Failed to verify double submit cookie.')

  const idToken = formData.get(CREDENTIAL)
  if (!idToken) throw new Error('No idToken in post body.')

  // 1. Validate idToken.
  const jwt = parseJWT(idToken)
  const claims = jwt.payload

  let now = Math.floor(Date.now() / 1000)

  // 1.1 Validate expiration.
  if (claims.exp < now) {
    throw new Error('expired token')
  }

  // 1.2 Validate idToken.
  const token_info = await getTokenInfo(idToken);
  if (!token_info) throw new Error('Invalid idToken.')

  // 1.3 Expected same aud
  if (token_info.aud !== claims.aud) throw new Error('Invalid aud.')

  // 1.4 Expected iss to be accounts.google.com
  if (token_info.iss !== "https://accounts.google.com") throw new Error('Invalid aud.')

  return {
    email: token_info.email,
    name: token_info.name,
    image: token_info.picture,
  } as UserInfo
}
