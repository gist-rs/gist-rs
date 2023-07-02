# gist-rs

## Dev

```
# WMR
yarn start

# Page
yarn dev-pages
```

## IDEA

- User can mint 32x32 to 16x16 (=256) `NFT` from browser via `sugar` wasm.
  - Create `AOT` from seed `pixpix` for user `wallet_address`.
  - Add pixel data to `AOT` account data.
  - Add meta data to `AOT` account data.
  - Add `aot_address` to compression `NFT`.
  - Calculate fee, Set fee payer, Set `NFT` owner.
- User can see owned `NFT` via `phantom` wallet.
- System able to validate that user owned `NFT` by user wallet_address.
- User able to select empty field and browse 32x32 into canvas.
- User able to buy empty field.
- User able to select non-emptied field and browse 32x32 into canvas for replacement.
- User able to buy non-emptied field.
- System able to calculate higher price for non-emptied field against block number.
- System able to reassign any 256 `NFT` address to new `NFT` address.
