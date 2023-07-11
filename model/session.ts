export type UserInfo = {
  name: string
  picture: string
  email: string
}

export type Web3UserInfo = {
  pubkey: String,
  phantom: {
    data: { app_url: String, timestamp: number, chain: 'solana', cluster: 'mainnet-beta' | 'devnet' | 'testnet' },
    session: String,
  }
}