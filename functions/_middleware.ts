import { get_user_info_from_request_cookie } from "./auth/jwt";

interface Env {
  KV: KVNamespace;
}

const authentication: PagesFunction<Env> = async (context) => {
  const response: Response = await context.next()
  // const value = await context.env.KV.get('example');
  // response.headers.set('x-token', 'god')

  // Inject data to index page
  const request: Request = context.request;
  const { pathname } = new URL(request.url)

  switch (pathname) {
    case "/diff":
      const user_info = await get_user_info_from_request_cookie(request)
      const original_body = await response.text();
      const data = JSON.stringify({ user_info });
      const body = `<script>window.__SESSION__=${data}</script>` + original_body
      const new_response = new Response(body, response);
      return new_response

    default: return response;
  }
}

export const onRequest = [authentication]
