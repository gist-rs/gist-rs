import { handle_google_auth } from "./google"
import { handle_phantom_deeplink } from "./phantom"

export enum ProviderName {
  Google = "google",
  Phantom = "phantom",
}

export const onRequestGet: PagesFunction<unknown, "provider"> = (context) => {
  const { provider } = context.params
  switch (provider) {
    case ProviderName.Google: return handle_google_auth(context)
    case ProviderName.Phantom: return handle_phantom_deeplink(context)
    default: return new Response('Wat?')
  }
}
