export async function onRequest(context) {
  let response: Response = await context.env.SERVICE.fetch(context.request, context);
  let url = await response.text()

  console.log('url:', url)

  return fetch(url)
}