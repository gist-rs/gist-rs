export const PHANTOM_DEEPLINK_URL = 'https://phantom.app/ul/v1/'

export enum PhantomAction {
  Connect = 'connect'
}

export type SolanaPayOptions = {
  spl_token: string
  reference: string
  label: string
  message: string
}

export const get_solana_pay_link = (recipient: string, amount?: number, options?: SolanaPayOptions) => {
  const { spl_token, reference, label, message } = options || {}
  const params = Object.entries({ reference, label, message }).filter((e) => e[1])
  const params_object = Object.fromEntries(params)
  if (!isNaN(amount)) {
    params_object.amount = amount.toString()
  }
  const searchParams = new URLSearchParams(params_object)

  // Special case for 'spl-token'
  searchParams['spl-token'] = spl_token
  const url = new URL(`solana:${recipient}?${searchParams}`)
  return url.toString()
}

export const get_phantom_link = (action: PhantomAction) => {
  return `${PHANTOM_DEEPLINK_URL}/${action}`
}