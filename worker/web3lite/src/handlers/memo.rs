use solana_web3_wasm::solana_extra_wasm::program::spl_memo::ID;
use solana_web3_wasm::solana_sdk::pubkey::Pubkey;

pub fn find_reference_pubkey_from_receipt(
    recipient_pubkey: &Pubkey,
    receipt_file_hash: &str,
) -> Pubkey {
    let (pubkey, _) = Pubkey::find_program_address(
        &[recipient_pubkey.as_ref(), receipt_file_hash.as_bytes()],
        &ID,
    );

    pubkey
}

// TODO: test_find_reference_pubkey_from_receipt
