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