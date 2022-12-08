interface Env {
  KV: KVNamespace;
}

const authentication = async (context: any) => {
  const response: Response = await context.next()
  // const value = await context.env.KV.get('example');
  response.headers.set('x-token', 'god')

  // Inject data to index page
  const request: Request = context.request;
  const { pathname } = new URL(request.url)

  switch (pathname) {
    case "/":
      const original_body = await response.text();
      const key = '3mPuPCgmdexxcSYtpKDTPktTnEYHJcsZxCJdfemN1xgt';
      const data = JSON.stringify({ pubkey: key });
      const body = `<script>sessionStorage.setItem('${key}', '${data}')</script>` + original_body
      const new_response = new Response(body, response);
      return new_response

    default: return response;
  }
}

export const onRequest = [authentication]
