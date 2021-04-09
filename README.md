# blockfrost-yoroi-bridge

The calls documented at https://github.com/Emurgo/yoroi-graphql-migration-backend/

- [X] txs/utxoForAddresses
 - Data from `addresses/utxo`, getting block number from `block` by hash
- [X] account/registrationHistory
 - From `accounts/registrations`
- [X] account/state
 - Directly from `accounts`
- [X] account/rewardHistory
 - `accounts/rewards`
- [X] pool/info
 - `/pools/` with `pools/history`
- [X] pool/delegationHistory
 - `accoounts/delegations`
- [X] v2/addresses/filterUsed
 - Loop thought `/addresses` to get 404
- [ ] v2/txs/history
- [X] v2/bestblock
 - Data from `/blocks/latest`
- [X] txs/signed
 - Fowarding to `/txs/submit`
- [X] status
 - Data from `/health`
- [X] v2/importerhealthcheck
 - Just return 200 upon `/health`
