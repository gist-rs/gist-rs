export function onRequest(context) {
  return context.env.SERVICE.fetch(context.request, context);
}