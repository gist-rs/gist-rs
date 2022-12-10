
// interface Env {
//   SERVICE: Fetcher;
// }

// export const onRequest: PagesFunction<Env> = async (context) => {
//   const { command } = context.params
//   console.log('command:', command)
//   if (!context.env.SERVICE) {
//     return new Response('❌ expect SERVICE')
//   }
//   return context.env.SERVICE.fetch(context.request);
// }

export function onRequest(context) {
  // return new Response(JSON.stringify(context.params.command) + ':' + !!context.env.SERVICE)
  return context.env.SERVICE.fetch(context.request, context);
}
