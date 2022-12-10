
interface Env {
  SERVICE: Fetcher;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { command } = context.params
  console.log('command:', command)
  return context.env.SERVICE.fetch(context.request);
}
