## Dev

```
npx wrangler dev
npx wrangler deploy
```

## Note

- `http://127.0.0.1:8787/pay/solana:mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN?amount=0.01&spl-token=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`

## TODO

- [ ] Login with Google.
- [x] Mint `TEST` token on `devnet`.
- [ ] Mint `YUZU` token on `mainnet`.
- [ ] Create derived account for each user.
- [ ] Test payment flow.
- [ ] Create payment option page with price calculator.
- [ ] Crate prompt pay QR code.
- [ ] Create solana pay QR code.
- [ ] Add link to phantom wallet app.
- [ ] Create add reserve page.
- [ ] Reserve by deduct gem and side effect to chain.
- [ ] Create session mapping in KV.
- [ ] Update tx status after confirm.
- [ ] QR for phantom with callback for notify signature confirmation.
- [ ] Schedule trigger every end of each hour + 1min to consolidate contract(pay to server, proceed next hour reservation).

## TOHAVE

- [ ] Cancelable with resell.

## User.Profile

```json
{
  "user::profile::md5(user_email)": {
    "id": "user::profile::md5(user_email)",
    "email": "katopz+user@gmail.com",
    "wallet_address": "user_waLLetAddreSs",
    "last_seen": "2023-06-01T10:00:00.0z"
  },
  "server::profile::md5(user_email)": {
    "id": "user::profile::md5(user_email)",
    "email": "katopz+server@gmail.com",
    "wallet_address": "server_waLLetAddreSs",
    "last_seen": "2023-06-01T10:00:00.0z"
  }
}
```

## User.Tickets

```json
{
  "user::ticket::user_waLLetAddreSs::2023-06-01::10": {
    "id": "user::ticket::user_waLLetAddreSs::2023-06-01::10",
    "server_wallet_address": "server_WalletAddReSs",
    // ui
    "user_wallet_address": "user_waLLetAddreSs",
    "date": "2023-06-01",
    "begin_time": "10",
    "end_time": "11"
  }
}
```

## Wallet

```json
{
  "wallet::user::user_waLLetAddreSs": {
    "id": "wallet::user::user_waLLetAddreSs",
    "wallet_address": "user_waLLetAddreSs",
    "email": "katopz+user@gmail.com",
    "most_recent_confirmed_signature": "3kx6hjvC9LNbrQzbNAnkC1QSvxVzXXYHubqukj12EBwye3DYH1hJSSMsMj8Yg6dcysnR6B6MfPYPWTZiCTCRz84E"
  },
  "wallet::server::server_WalletAddReSs": {
    "id": "wallet::server::server_WalletAddReSs",
    "wallet_address": "server_WalletAddReSs",
    "email": "katopz+server@gmail.com",
    "most_recent_confirmed_signature": "4kx6hjvC9LNbrQzbNAnkC1QSvxVzXXYHubqukj12EBwye3DYH1hJSSMsMj8Yg6dcysnR6B6MfPYPWTZiCTCRz84E"
  },
  "platform::server::platform_WalletAddReSs": {
    "id": "wallet::platform::platform_WalletAddReSs",
    "wallet_address": "platform_WalletAddReSs",
    "email": "katopz+platform@gmail.com",
    "most_recent_confirmed_signature": "5kx6hjvC9LNbrQzbNAnkC1QSvxVzXXYHubqukj12EBwye3DYH1hJSSMsMj8Yg6dcysnR6B6MfPYPWTZiCTCRz84E"
  }
}
```

## Transactions

```json
{
  "transaction::user_waLLetAddreSs::server_WalletAddReSs": {
    "id": "transaction::user_waLLetAddreSs::server_WalletAddReSs",
    "user_wallet_address": "user_waLLetAddreSs", // reference
    "server_wallet_address": "server_WalletAddReSs", // label
    "tx_data": "{tx_data}",
    "tx_signature": "3kx6hjvC9LNbrQzbNAnkC1QSvxVzXXYHubqukj12EBwye3DYH1hJSSMsMj8Yg6dcysnR6B6MfPYPWTZiCTCRz84E",
    "tx_status": "COMMITTED", // QUEUED, COMMITTED, INVALID(client fault), FAILED(server fault), CONFIRMED
    "tx_memo": "receipt_file_id", // order_id aka receipt_file_id or None.
    // ui
    "tx_method": "transfer",
    "tx_params": {
      "from": "user_waLLetAddreSs",
      "to": "platform_WalletAddReSs",
      "amount_str": "1000.001",
      "amount_ui": "1,000.001",
      "amount_float": 1000.001
    }
  }
}
```

## Reservations

```json
{
  "2023-06-01::10::server_WalletAddReSs": {
    "id": "2023-06-01::10::server_WalletAddReSs",
    "user_wallet_address": undefined,
    "server_wallet_address": "server_WalletAddReSs",
    "time_start": "2023-06-20T16T10:0Z",
    "time_end": "2023-06-20T17T10:0Z",
    "status": "AVAILABLE", // AVAILABLE, RESERVED, DONE, MAINTENANCE, BANNED, RESELL
    "user_bided": undefined,
    "bided_signature": undefined,
    "base_price": 1,
    "demand": 1, // previous_demand + yesterday_demand // (1 + 1) / 2
    "demand_rate": 0.5,
    "target_price": 1.5, // demand_rate * demand + latest_price // (1 * 0.5) * 1
    "server_offered": 1.5,
  },
  "2023-06-01::01::server_WalletAddReSs": {
    ...,
    "user_wallet_address": "user_waLLetAddreSs",
    "user_bided": 1.5,
    "status": "RESERVED",
    "bided_signature": "maybe-signature-confirmed",
  },
  "2023-06-01::02::server_WalletAddReSs": {
    ...,
    "status": "DONE",
    "paid_platform_fee_amount": 0.3,
    "paid_server_amount": 1.2,
    "paid_signature": "maybe-signature-confirmed",
  },
  "2023-06-01::03::server_WalletAddReSs": {
   ...,
   "status": "MAINTENANCE",
  }
}
```

## Server

```json
{
  "4090RTX::server_WalletAddReSs": {
    "id": "4090RTX::server_WalletAddReSs",
    "class": "4090RTX",
    "spec": {},
    "email": "katopz@gmail.com",
    "wallet_address": "server_WalletAddReSs",
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
