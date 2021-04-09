# blockfrost-yoroi-bridge

- [ ] txs/utxoForAddresses
 - Data from `addresses/utxo`
- [ ] account/registrationHistory
- [ ] account/state
- [ ] account/rewardHistory
- [ ] pool/info
- [ ] pool/delegationHistory
- [ ] v2/addresses/filterUsed
- [ ] v2/txs/history
- [X] v2/bestblock
 - Data from `/blocks/latest`
- [X] txs/signed
 - Fowarding to `/txs/submit`
- [X] status
 - Data from `/health`
- [X] v2/importerhealthcheck
 - Just return 200 upon `/health`
