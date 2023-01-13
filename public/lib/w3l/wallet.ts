import { Web3LiteClient } from "."

export class Web3LiteWallet {
  client: Web3LiteClient

  constructor(client: Web3LiteClient) {
    this.client = client
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