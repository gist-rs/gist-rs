export type UiBalance = {
  lamports: number
  sol: number
  ui_sol: string
}

export class Web3LiteClient {
  rpc_url: string
  constructor(options = {}) {
    const { rpc_url } = {
      rpc_url: 'https://rpc.ankr.com/solana',
      ...options
    }
    this.rpc_url = rpc_url
  }

  call = async (method, params) => {
    const id = new Date().valueOf()
    const result = await fetch(this.rpc_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id,
        method,
        params
      })
    })

    return await result?.json()
  }

  get_balance = async (pubkey, options = {}) =>
    new Promise<UiBalance>(async (resolve, reject) => {
      const { maximumFractionDigits } = {
        maximumFractionDigits: 2,
        ...options
      }

      const { result } = await this.call('getBalance', [pubkey]).catch(reject)
      if (isNaN(result?.value)) {
        reject(new Error('No value.'))
      }

      const { value: lamports } = result

      const sol = lamports / Math.pow(10, 9) || 0
      const ui_sol = sol.toLocaleString('en-US', {
        maximumFractionDigits
      })
      resolve({
        lamports,
        sol,
        ui_sol
      })
    })
}
export class Web3LiteWallet {
  client: Web3LiteClient
  constructor(client: Web3LiteClient) {
    this.client = client
  }

  to_base64(str: string) {
    str = typeof str === 'object' ? JSON.stringify(str) : str
    return btoa(encodeURIComponent(str))
  }

  from_base64(str: string) {
    return decodeURIComponent(atob(str))
  }

  connect = () => this.post_message('connect')

  post_message = async (method: string, params = {}) =>
    new Promise((resolve, _reject) => {
      const id = new Date().valueOf()
      window.addEventListener(
        'message',
        (event) => {
          if (!event.data) return
          const { data } = event
          if (!data.result) return

          if (data.id === id) return resolve(data.result)
        },
        false
      )

      // @ts-ignore
      window.solana.postMessage({
        method,
        params,
        id,
        jsonrpc: '2.0'
      })
    })

  connect_phantom = async () =>
    new Promise(async (resolve, reject) => {
      this.post_message('connect').then((result: { publicKey: string }) => {
        return result?.publicKey ? resolve(result.publicKey) : reject('Not connected')
      })
    })
}

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

export const get_solana_pay_link = (recipient: string, amount: number, options?: SolanaPayOptions) => {
  const { spl_token, reference, label, message } = options || {}
  const params = Object.entries({ spl_token, reference, label, message }).filter((e) => e[1])
  const params_object = Object.fromEntries(params)
  console.log('params:', params)
  console.log('params_object:', params_object)
  const searchParams = new URLSearchParams({
    amount: amount.toString(),
    ...params_object
  })

  const url = new URL(`solana:${recipient}?${searchParams}`)
  return url.toString()
}

export const get_phantom_link = (action: PhantomAction) => {
  return `${PHANTOM_DEEPLINK_URL}/${action}`
}