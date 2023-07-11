## Dev

```
npx wrangler dev
npx wrangler deploy
```

## Note

- `http://127.0.0.1:8787/pay/solana:mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN?amount=0.01&spl-token=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`

## TODO

- [x] Login with Google.
- [ ] Create reservation page. // weekly
- [ ] Create reservation after deduct gem.
- [ ] POC access as reserved. // https://github.com/cloudflare/workers-access-external-auth-example/blob/main/index.js
- [ ] Schedule trigger every end of each hour + 1min to consolidate contract(pay to miner, proceed next hour reservation).
- [ ] Crate prompt pay QR code.
- [ ] Test offchain payment flow from google form.
- [ ] Create payment option page with price calculator.

## TOHAVE

- [x] Mint `TEST` token on `devnet`.
- [ ] Mint `YUZU` token on `mainnet`.
- [ ] Create derived account for each user.
- [ ] Create solana pay QR code.
- [ ] Add link to phantom wallet app.
- [ ] Reserve side effect to chain.
- [ ] Update tx status after confirm.
- [ ] QR for phantom with callback for notify signature confirmation.
- [ ] Cancelable with resell.

## User.Profile

`DIFF_USERS`

```json
{
  "user::profile::md5(user_email)": {
    "id": "...",
    "email": "katopz+user@gmail.com",
    "wallet_address": "user_waLLetAddreSs",
    "last_seen": "2023-06-01T10:00:00.0z"
  },
  "miner::profile::md5(user_email)": {
    "id": "...",
    "email": "katopz+miner@gmail.com",
    "wallet_address": "miner_waLLetAddreSs",
    "last_seen": "2023-06-01T10:00:00.0z"
  }
}
```

## User.Tickets

`DIFF_TICKET`

```json
{
  "ticket::2023-06-01::10::user_waLLetAddreSs": {
    "id": "...",
    "miner_wallet_address": "miner_WalletAddReSs",
    // ui
    "user_wallet_address": "user_waLLetAddreSs",
    "date": "2023-06-01",
    "begin_time": "10",
    "end_time": "11"
  }
}
```

## Wallet

`DIFF_WALLET`

```json
{
  "user::md5(email)": {
    "id": "...",
    "wallet_address": "user_waLLetAddreSs",
    "email": "katopz+user@gmail.com",
    "most_recent_confirmed_signature": "3kx6hjvC9LNbrQzbNAnkC1QSvxVzXXYHubqukj12EBwye3DYH1hJSSMsMj8Yg6dcysnR6B6MfPYPWTZiCTCRz84E",
    "nonce": 1
  },
  "miner::md5(email)": {
    "id": "...",
    "wallet_address": "miner_WalletAddReSs",
    "email": "katopz+miner@gmail.com",
    "most_recent_confirmed_signature": "4kx6hjvC9LNbrQzbNAnkC1QSvxVzXXYHubqukj12EBwye3DYH1hJSSMsMj8Yg6dcysnR6B6MfPYPWTZiCTCRz84E",
    "nonce": 1
  },
  "platform::md5(email)": {
    "id": "wallet::platform::platform_WalletAddReSs",
    "wallet_address": "platform_WalletAddReSs",
    "email": "katopz+platform@gmail.com",
    "most_recent_confirmed_signature": "5kx6hjvC9LNbrQzbNAnkC1QSvxVzXXYHubqukj12EBwye3DYH1hJSSMsMj8Yg6dcysnR6B6MfPYPWTZiCTCRz84E",
    "nonce": 1
  }
}
```

## Proofs

`DIFF_PROOF`

> Can release with offchain via email or onchain transfer.

```json
{
  "proof::2023-06::user_waLLetAddreSs::offchain_blocknumber" {
    "id": "...",
    "from": "user_waLLetAddreSs", // reference
    "to": "miner_WalletAddReSs", // label
    "amount": 1000.001,
    "receipt_id": "{receipt_id}", // order_id aka receipt_id or onchain_tx_signature.
    "offchain_signature": "3kx6hjvC9LNbrQzbNAnkC1QSvxVzXXYHubqukj12EBwye3DYH1hJSSMsMj8Yg6dcysnR6B6MfPYPWTZiCTCRz84E",
    "offchain_blocknumber": {offchain_blocknumber},
    "onchain_blocknumber": {maybe_onchain_blocknumber}
  }
}
```

## Transactions (TBD)

`DIFF_TRANSACTION`

```json
{
  "tx::2023-06::user_waLLetAddreSs::tx_hash": {
    "id": "...",
    "user_wallet_address": "user_waLLetAddreSs", // reference
    "miner_wallet_address": "miner_WalletAddReSs", // label
    // raw
    "method": "transfer",
    "params": {
      "from": "user_waLLetAddreSs",
      "to": "platform_WalletAddReSs",
      "amount": 1000.001,
      "ui_amount": "1000.001"
    },
    // request
    "data": "{signed_data}",
    "memo": "{receipt_file_id}", // order_id aka receipt_file_id or None.
    // response
    "signature": "3kx6hjvC9LNbrQzbNAnkC1QSvxVzXXYHubqukj12EBwye3DYH1hJSSMsMj8Yg6dcysnR6B6MfPYPWTZiCTCRz84E",
    // result
    "status": "QUEUE" // QUEUE, COMMIT, PUSH, CLIENT_ERROR, MINER_ERROR, CONFIRM
  }
}
```

## Reservations

`DIFF_RESERVATION`

```json
{
  "2023-06-01::01::miner_WalletAddReSs": {
    "id": "...",
    "user_wallet_address": undefined,
    "miner_wallet_address": "miner_WalletAddReSs",
    "hour": 0,
    "time_start": "2023-07-05T00:15:24.871Z",
    "time_end": "2023-07-05T01:00:0.0Z",
    "status": "AVAILABLE", // AVAILABLE, RESERVED, USING, USED, RATED, DONE, MAINTENANCE, BANNED, RESELL
    "user_bided": undefined,
    "transaction_id": undefined,
    "base_price": 1,
    // "demand": 1, // previous_demand + yesterday_demand // (1 + 1) / 2
    // "demand_rate": 0.5,
    // "target_price": 1.5, // demand_rate * demand + latest_price // (1 * 0.5) * 1
    "offered_price": 1.5,
  },
  "2023-06-01::02::miner_WalletAddReSs": {
    ...,
    "user_wallet_address": "user_waLLetAddreSs",
    "user_bided": 1.5,
    "status": "RESERVED",
    "time_start": "2023-07-05T00:15:24.871Z",
    "time_end": "2023-07-05T01:00:0.0Z",
    "transaction_id": "transaction_id",
  },
  "2023-06-01::03::miner_WalletAddReSs": {
    ...,
    "status": "RATED",
    "rating": 1,
  },
  "2023-06-01::03::miner_WalletAddReSs": {
    ...,
    "status": "DONE",
    "paid_platform_fee_amount": 0.3,
    "paid_miner_amount": 1.2,
    "transaction_id": "transaction_id",
  },
  "2023-06-01::04::miner_WalletAddReSs": {
   ...,
   "status": "MAINTENANCE",
  }
}
```

## Miner

```json
{
  "4090RTX::miner_WalletAddReSs": {
    "id": "...",
    "class": "4090RTX",
    "spec": {},
    "email": "katopz@gmail.com",
    "wallet_address": "miner_WalletAddReSs",
    "sum_rating": 5,
    "total_rating": 1,
    "status": "IDLE" // IDLE, WORKING, BANNED
  }
}
```

## Platform

```json
{
  "weekly_swap_rate": [1.0, 1.1, 1.2, 1.3, 1.3, 1.2, 1.0],
  "platform_fee_percent": 0.1
}
```

- [ ] Transfer token after session end.

## TOHAVE

- [ ] Add connect phantom wallet button.
- [ ] Discord.
