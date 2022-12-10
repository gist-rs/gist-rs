export function onRequest(context) {
  // return new Response(JSON.stringify(context.params.user) + ':' + !!context.env.SERVICE)
  return context.env.SERVICE.fetch(context.request, context);
}
