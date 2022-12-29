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
    // TODO: read from cookie?
    // case "/":
    //   const original_body = await response.text();
    //   const pubkey = '3mPuPCgmdexxcSYtpKDTPktTnEYHJcsZxCJdfemN1xgt';
    //   const data = JSON.stringify({ pubkey });
    //   const body = `<script>window.__STATE__=${data}</script>` + original_body
    //   const new_response = new Response(body, response);
    //   return new_response

    default: return response;
  }
}

export const onRequest = [authentication]
