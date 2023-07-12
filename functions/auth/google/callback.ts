
import { parse } from "cookie";
import { google } from '../../lib/cf-auth';
import { parseJWT } from '../../utils/jwt';
import { new_response_with_user_cookie } from "../jwt";
import { UserInfo } from "../user";

export const fetch_id_token_info = async (idToken: string): Promise<any> => {
  const result = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`, {
    headers: {
      "content-type": "application/json",
    },
    method: "GET"
  });

  const json = await result.json()
  return json
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
    // Get token info from request.
    const id_token_info = await get_id_token_info(context.request)

    // TBD: redirect by member state.
    const url = new URL(context.request.url)
    let response = Response.redirect(url.origin, 301);
    let new_response = await new_response_with_user_cookie(response, id_token_info, url.hostname, (context.env as any).ENCODE_JWT_TOKEN, (context.env as any).COOKIES_GOOGLE_KEY_NAME)

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
      picture: providerUser.picture,
    } as UserInfo
  }
}

async function get_id_token_info(request: Request) {
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
  const id_token_info = await fetch_id_token_info(idToken);
  if (!id_token_info) throw new Error('Invalid idToken.')

  // 1.3 Expected same aud
  if (id_token_info.aud !== claims.aud) throw new Error('Invalid aud.')

  // 1.4 Expected iss to be accounts.google.com
  if (id_token_info.iss !== "https://accounts.google.com") throw new Error('Invalid aud.')

  return id_token_info
}
