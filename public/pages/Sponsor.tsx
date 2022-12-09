import { useEffect, useState } from 'preact/hooks'
import { get_qr } from '../lib/qr'
import { get_solana_pay_link, Web3LiteClient, Web3LiteWallet } from '../lib/web3lite'

export const GIST_PUBKEY = 'gistmeAhMG7AcKSPCHis8JikGmKT9tRRyZpyMLNNULq'
export const PATREON_URL = 'https://patreon.com/gist_rs'
const web3l_client = new Web3LiteClient()

export default function Sponsor() {
  const [public_key, set_public_key] = useState<string>()
  const [lamports, set_lamports] = useState(0)

  const default_solana_pay_link = get_solana_pay_link(GIST_PUBKEY)
  const [solana_pay_link] = useState<string>(default_solana_pay_link)

  useEffect(() => {
    web3l_client
      .get_balance(GIST_PUBKEY)
      .then(({ sol }) => {
        set_lamports(sol)
      })
      .catch(console.error)
  }, [])

  const connect_phantom = () => {
    const web3l_wallet = new Web3LiteWallet(web3l_client)
    web3l_wallet.connect_phantom().then(async (public_key: string) => {
      set_public_key(public_key)

      // @ts-ignore
      window.__STATE__.public_key = public_key
      console.log('connected:', public_key)
    })
  }

  return (
    <div>
      <a href="/">Home</a>
      <pre class="tag">◎ {lamports}</pre>
      <pre class="tag">{public_key}</pre>
      <hr />
      <img src={get_qr(solana_pay_link)} />
      <hr />
      <a href={solana_pay_link} title="Solana Pay" aria-label="Solana Pay">
        Solana Pay {solana_pay_link}
      </a>
      <hr />
      <a href="https://phantom.app/ul/v1/connect?app_url=https://gist.rs&dapp_encryption_public_key=gistmeAhMG7AcKSPCHis8JikGmKT9tRRyZpyMLNNULq&redirect_link=https://gist.rs/phantom&">connect</a>
      <hr />
      <img src={get_qr(PATREON_URL)} alt={PATREON_URL} />
      <hr />
      <a href={PATREON_URL} title="Sponsor" aria-label="Patreon" target="_blank" rel="noopener">
        Patreon
      </a>
    </div>
  )
}
