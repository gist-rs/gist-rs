export function onRequest(context) {
  console.log('hello')
  return context.env.SERVICE.fetch(context.request, context);
}