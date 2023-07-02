export function onRequest(context) {
  // 1. Gathering params.
  const request: Request = context.request;
  const { searchParams: search_params } = new URL(request.url);
  if (!search_params) return new Response('ERROR: expect searchParams');

  // 2. Parse error
  const error = search_params.toString();
  const body = `<pre><code style="width: fit-content; height: fit-content">${JSON.stringify(error, null, 2)}</code></pre>`

  return new Response(body);
}