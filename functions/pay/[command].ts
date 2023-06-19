export function onRequest(context) {
  return context.env.DIFF.fetch(context.request, context);
}