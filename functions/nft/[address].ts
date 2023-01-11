export function onRequest(context) {
  return new Response(`TODO: Read cached from KV: ${context.params.address}`);
  // return context.env.SERVICE.fetch(context.request, context);
}
