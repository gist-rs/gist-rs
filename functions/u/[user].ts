export function onRequest(context) {
  return new Response(JSON.stringify(context.params.user) + ':' + !!context.env.DIFF)
  // return context.env.DIFF.fetch(context.request, context);
}
