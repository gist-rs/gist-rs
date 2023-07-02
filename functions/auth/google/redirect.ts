import queryString from "query-string";

export function onRequest(context) {
  const redirectUrl = context.env.GOOGLE_REDIRECT_DEV_URL || context.env.GOOGLE_REDIRECT_PROD_URL;
  const clientId = context.env.GOOGLE_CLIENT_ID;

  console.log("[redirectUrl]", redirectUrl);

  const params = queryString.stringify({
    client_id: clientId,
    redirect_uri: redirectUrl,
    response_type: "code",
    scope: "openid email profile",
    include_granted_scopes: "true",
    state: "pass-through value",
  });

  const loginUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;

  return Response.redirect(loginUrl, 301)
}