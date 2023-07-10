import * as base58 from "bs58";
import { UserInfo } from "../../auth/google/callback";

export type MemberInfo = {
  user_info: UserInfo
  wallet_address: string
}

export async function upsert_member(user_info: UserInfo) {
  // 2. Create or Update user
  // 2.1 Gen and connect email to wallet.
  // TODO use web3lite service binding
  const wallet_address = base58.encode(new TextEncoder().encode(user_info.email))

  // 2.2 Save to KV?
  // TODO

  return {
    user_info,
    wallet_address,
  } as MemberInfo
}
