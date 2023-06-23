use solana_web3_wasm::{
    solana_client_wasm::WasmClient,
    solana_extra_wasm::program::{
        spl_associated_token_account::{self, instruction::create_associated_token_account},
        spl_token,
    },
    solana_sdk::{pubkey::Pubkey, transaction::Transaction},
};

struct MintToInfo {
    mint_pubkey: Pubkey,
    amount: u64,
    decimals: u8,
}

pub async fn create_mint_token22_memo_fee(
    client: &WasmClient,
    signer_pubkey: &Pubkey,
    receiver_pubkey: &Pubkey,
    mint_pubkey: &Pubkey,
    amount: u64,
    decimals: u8,
) -> anyhow::Result<Transaction> {
    // 1. create associated if need.
    let assoc =
        spl_associated_token_account::get_associated_token_address(&receiver_pubkey, &mint_pubkey);

    let assoc_instruction = create_associated_token_account(
        signer_pubkey,
        &receiver_pubkey,
        &mint_pubkey,
        &spl_token::ID,
    );

    // 2. create mint by mint_pubkey
    let mint_to_instruction = spl_token::instruction::mint_to(
        &spl_token::ID,
        &mint_pubkey,
        &assoc,
        &signer_pubkey,
        &[&signer_pubkey],
        amount,
    )?;

    // 3. mint to
    let recent_blockhash = client.get_latest_blockhash().await?;
    let transaction = Transaction::new_with_payer(
        &[assoc_instruction, mint_to_instruction],
        Some(&signer_pubkey),
    );

    // let result = client.send_and_confirm_transaction(&transaction).await?;

    // println!("SPL Tokens minted successfully.");
    // println!("Amount: {}", amount);
    // println!("Receiver pubkey: {}", receiver_pubkey.to_string());
    // println!("Associated token account: {}", assoc.to_string());

    // Ok(MintToInfo {
    //     mint_pubkey: *mint_pubkey,
    //     amount,
    //     decimals,
    // })
    Ok(transaction)
}

#[derive(Debug)]
pub struct NftPayload {
    pub wallet_address_string: String,
    pub uri: String,
    pub title: String,
}

#[cfg(test)]
mod test {
    use std::str::FromStr;

    use solana_web3_wasm::{
        core::client::Web3WasmClient,
        solana_client_wasm::WasmClient,
        solana_extra_wasm::program::spl_token,
        solana_sdk::{
            pubkey::Pubkey, signature::Keypair, signer::Signer, system_instruction,
            transaction::Transaction,
        },
    };

    use crate::tools::minter::create_mint_token22_memo_fee;

    const AIRDROP_AMOUNT: u64 = 10000000; // tx free of 5000 lamports included

    async fn wait_for_balance_change(
        client: &WasmClient,
        account: &Pubkey,
        balance_before: u64,
        expected_change: u64,
    ) {
        let mut i = 0;
        let max_loops = 60;
        loop {
            let balance_after = client.get_balance(account).await.unwrap();
            // NOTE might happen that alice is airdropped only after she
            // transferred the amount to BOB
            match balance_after.checked_sub(balance_before) {
                Some(0) => {
                    std::thread::sleep(std::time::Duration::from_secs(1));
                    i += 1;
                    dbg!(i);
                }
                Some(delta) => {
                    assert_eq!(delta, expected_change);
                    break;
                }
                None => {
                    assert_eq!(balance_before - balance_after, expected_change);
                    break;
                }
            }
            if i == max_loops {
                panic!("test was running for {} seconds", max_loops);
            }
        }
    }

    #[tokio::test]
    async fn test_create_mint_token22_memo_fee() {
        let client: WasmClient = Web3WasmClient::new_devnet();

        let alice = Keypair::new();

        let balance_before_airdrop_alice = client.get_balance(&alice.pubkey()).await.unwrap();

        client
            .request_airdrop(&alice.pubkey(), AIRDROP_AMOUNT)
            .await
            .unwrap();

        // Wait for richer Alice
        wait_for_balance_change(
            &client,
            &alice.pubkey(),
            balance_before_airdrop_alice,
            AIRDROP_AMOUNT,
        )
        .await;

        let balance_after = client.get_balance(&alice.pubkey()).await.unwrap();
        assert!(balance_after > balance_before_airdrop_alice);

        // Alice is ready
        let space = 0;
        let rent_exemption_amount = client
            .get_minimum_balance_for_rent_exemption(space)
            .await
            .unwrap();

        // Bob ready
        let bob = Keypair::new();

        // Mint address
        let mint_pubkey = Pubkey::new_unique();
        let create_mint_token22_memo_fee_tx = create_mint_token22_memo_fee(
            &client,
            &alice.pubkey(),
            &bob.pubkey(),
            &mint_pubkey,
            10000000u64,
            6u8,
        )
        .await
        .unwrap();

        let signature = client
            .send_transaction(&create_mint_token22_memo_fee_tx)
            .await;
        println!("signature{:?}", signature);
        assert!(signature.is_ok())
    }
}
