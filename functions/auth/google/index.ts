export const handle_google_auth = async (context) => {
  // 1. Gathering params.
  const request: Request = context.request;
  const { searchParams: search_params, hostname } = new URL(request.url);
  if (!search_params) return new Response('ERROR: expect searchParams');

  const body = `<a href='/auth/google/redirect'>login</a>`;

  const response = new Response(body, {
    headers: { "content-type": "text/html" },
  });

  return response
}
