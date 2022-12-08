const authentication = async (context) => {
  const response = await context.next()
  response.headers.set('x-token', 'god')
  return response
}

export const onRequest = [authentication]
