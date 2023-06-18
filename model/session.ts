export type UserSessionType = {
  pubkey: String,
  phantom: {
    data: { app_url: String, timestamp: number, chain: 'solana', cluster: 'mainnet-beta' | 'devnet' | 'testnet' },
    session: String,
  }
}