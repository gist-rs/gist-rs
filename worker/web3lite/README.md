## Dev

```
npx wrangler dev
npx wrangler deploy
```

## TODO

- [ ] Mint `YUZU` token on `devnet`.
- [ ] Mint `YUZU` token on `mainnet`.
- [ ] Create derived account for each user.
- [ ] Test payment flow.
- [ ] Create payment option page with price calculator.
- [ ] Crate prompt pay QR code.
- [ ] Create solana pay QR code.
- [ ] Add link to phantom wallet app.
- [ ] Create add reserve page.
- [ ] Reserve in Queue.
- [ ] Worker consume queue and deduct gem when reserved. // Add to failed tx
- [ ] Create session mapping in KV.
- [ ] QR for phantom with callback for notify signature confirmation.

## TOHAVE

- [ ] Cancelable with resell.

## User

```json
{
  "md5(user_email)::uSeRwaLLetAddreSs": {
    "id": "user::md5(user_email)::uSeRwaLLetAddreSs",
    "email": "katopz@gmail.com",
    "wallet_address": "uSeRwaLLetAddreSs",
    "status": "IDLE" // IDLE, WORKING, BANNED
  }
}
```

## Wallet

```json
{
  "user::uSeRwaLLetAddreSs": {
    "id": "user::uSeRwaLLetAddreSs",
    "wallet_address": "uSeRwaLLetAddreSs",
    "email": "katopz@gmail.com",
    "last_confirmed_signature": "3kx6hjvC9LNbrQzbNAnkC1QSvxVzXXYHubqukj12EBwye3DYH1hJSSMsMj8Yg6dcysnR6B6MfPYPWTZiCTCRz84E"
  },
  "server::seRverWalletAddReSs": {
    "id": "server::seRverWalletAddReSs",
    "wallet_address": "seRverWalletAddReSs",
    "email": "katopz@gmail.com",
    "last_confirmed_signature": "3kx6hjvC9LNbrQzbNAnkC1QSvxVzXXYHubqukj12EBwye3DYH1hJSSMsMj8Yg6dcysnR6B6MfPYPWTZiCTCRz84E"
  }
}
```

## Transactions

```json
{
  "transaction::uSeRwaLLetAddreSs::seRverWalletAddReSs": {
    "id": "contract::uSeRwaLLetAddreSs::seRverWalletAddReSs",
    "user_wallet_address": "uSeRwaLLetAddreSs", // reference
    "server_wallet_address": "uSeRwaLLetAddreSs", // label
    "tx_data": "{tx_data}",
    "tx_signature": "3kx6hjvC9LNbrQzbNAnkC1QSvxVzXXYHubqukj12EBwye3DYH1hJSSMsMj8Yg6dcysnR6B6MfPYPWTZiCTCRz84E",
    "tx_status": "COMMITTED", // QUEUED, COMMITTED, INVALID(client fault), FAILED(server fault), CONFIRMED
    "tx_memo": "receipt_file_id", // order_id aka receipt_file_id or None.
    // ui
    "tx_method": "transfer",
    "tx_params": {
      "from": "uSeRwaLLetAddreSs",
      "to": "escrow_waLLetAddreSs",
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
  "2023-06-01::00:00::seRverWalletAddReSs": {
    "id": "2023-06-01::00:00::seRverWalletAddReSs",
    "user_wallet_address": undefined,
    "server_wallet_address": "seRverWalletAddReSs",
    "time_start": "2023-06-20T16:00:0Z",
    "time_end": "2023-06-20T17:00:0Z",
    "status": "AVAILABLE", // AVAILABLE, RESERVED, MAINTENANCE, BANNED, RESELL
    "user_bided": undefined,
    "signature": undefined,
    "base_price": 1,
    "demand": 1, // previous_demand + yesterday_demand // (1 + 1) / 2
    "demand_rate": 0.5,
    "target_price": 1.5, // demand_rate * demand + latest_price // (1 * 0.5) * 1
    "server_offered": 1.5,
  },
  "2023-06-01::00:01::seRverWalletAddReSs": {
    ...,
    "user_wallet_address": "uSeRwaLLetAddreSs",
    "user_bided": 1.5,
    "status": "RESERVED",
    "signature": "maybe-signature-confirmed",
  },
  "2023-06-01::00:02::seRverWalletAddReSs": {
   ...,
   "status": "AVAILABLE",
  },
  "2023-06-01::00:03::seRverWalletAddReSs": {
   ...,
   "status": "MAINTENANCE",
  }
}
```

## Server

```json
{
  "4090RTX::seRverWalletAddReSs": {
    "id": "4090RTX::seRverWalletAddReSs",
    "class": "4090RTX",
    "spec": {},
    "email": "katopz@gmail.com",
    "wallet_address": "seRverWalletAddReSs",
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
