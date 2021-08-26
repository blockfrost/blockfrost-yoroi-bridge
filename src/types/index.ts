import { Responses } from '@blockfrost/blockfrost-js';

export interface ReqAddresses {
  Body: {
    addresses: Array<string>;
  };
}

export interface ReqAccounts {
  Body: {
    // bech32 stake addresses
    addresses: Array<string>;
  };
}

export interface ReqPools {
  Body: {
    poolIds: Array<string>; // operator key (pool id)
  };
}

export interface ReqTxsHistory {
  Body: {
    // byron addresses, bech32 address, bech32 stake addresses or addr_vkh
    addresses: Array<string>;
    // omitting "after" means you query starting from the genesis block
    after?: {
      block: string; // block hash
      tx: string; // tx hash
    };
    untilBlock: string; // block hash - inclusive
  };
}

export interface ReqTxsSigned {
  Body: {
    // serialized tx
    signedTx: string;
  };
}

export interface txsUtxoForAddressesResult {
  utxo_id: string; // concat tx_hash and tx_index
  tx_hash: string;
  tx_index: number;
  block_num: number | null; // NOTE: not slot_no
  receiver: string;
  amount: string;
  assets: Asset[];
}

export interface address_utxo_content_single {
  /** Transaction hash of the UTXO */
  tx_hash: string;
  /** UTXO index in the transaction */
  tx_index: number;
  /** UTXO index in the transaction */
  output_index: number;
  amount: {
    /** The unit of the value */
    unit: string;
    /** The quantity of the unit */
    quantity: string;
  }[];
  /** Block number of the UTXO */
  block: string;
}

export interface AccountRegistrationHistoryResult {
  slot: number;
  txIndex: number;
  certIndex: number;
  certType: RegistrationState;
}

export interface AccountRegistrationHistoryYoroi {
  [address: string]: {
    slot: number;
    txIndex: number;
    certIndex: number;
    certType: RegistrationState;
  };
}

type RegistrationState = 'StakeRegistration' | 'StakeDeregistration';

export interface account_registration_content_single {
  /** Hash of the transaction containing the (de)registration certificate */
  tx_hash: string;
  /** Action in the certificate */
  action: 'registered' | 'deregistered';
}

export interface AccountStateYoroi {
  [address: string]: null | {
    poolOperator: null; // not implemented yet
    remainingAmount: string; // current remaining awards
    rewards: string; //all the rewards every added (not implemented yet)
    withdrawals: string; // all the withdrawals that have ever happened (not implemented yet)
  };
}

export interface AccountRewardHistoryYoroi {
  [address: string]: {
    epoch: number;
    reward: string | null;
    poolHash: string;
  }[];
}

export interface AccountRewardHistoryEpochContentYoroi {
  epoch: number;
  reward: string | null;
  poolHash: string;
}

export interface PoolInfoYoroi {
  [poolId: string]: null | {
    info: {
      name?: string; // ? should be undefined, as name?
      description?: string;
      ticker?: string;
      homepage?: string;
      extended?: string;
      //... // other stuff from SMASH.
    };
    history: {
      epoch: number;
      slot: number;
      tx_ordinal: number;
      cert_ordinal: number;
      payload: Certificate; // see `v2/txs/history`
    }[];
  };
}

export interface PoolInfoInfoYoroi {
  name?: string;
  description?: string;
  ticker?: string;
  homepage?: string;
}

export interface PoolInfoHistoryYoroi {
  epoch: number;
  slot: number;
  tx_ordinal: number;
  cert_ordinal: number;
  payload: Certificate; // see `v2/txs/history`
}

export interface GetRegistrationsTxsDetailsResults {
  stake_address: string;
  data: AccountRegistrationHistoryResult;
}

export interface GetRegistrationsTxsDetailsPromises {
  stake_address: string;
  promise: Promise<AccountRegistrationHistoryResult>;
}

export interface GetAddressesRegistrationsResults {
  stake_address: string;
  data: Responses['account_registration_content'];
}

export interface PoolInfoData {
  slot: number;
  txIndex: number;
  certIndex: number;
  certType: Certificate;
}

export interface PoolInfoData {
  slot: number;
  txIndex: number;
  certIndex: number;
  certType: Certificate;
}

export interface PoolInfoGet {
  pool: string;
  poolInfo: Responses['pool_metadata'] | null;
  poolGeneral: Responses['pool'] | null;
}

export interface PoolInfoGetPromise {
  poolInfo: Responses['pool_metadata'] | null;
  poolGeneral: Responses['pool'] | null;
}

export interface PoolInfoGetResult {
  pool: string;
  poolInfo: Responses['pool_metadata'] | null;
  poolGeneral: Responses['pool'] | null;
}

export interface PoolInfoGetHistoryPromise {
  poolHistory: PoolInfoGetHistoryYoroi[];
}

export interface PoolInfoGetHistoryResult {
  poolHistory: PoolInfoGetHistoryYoroi[];
}

export interface PoolInfoGetHistoryYoroi {
  epoch: number;
  slot: number;
  tx_ordinal: number;
  cert_ordinal: number;
  payload: Certificate; // see `v2/txs/history`
}

export interface PoolInfoGetHistoryExtraResult {
  pool: string;
  poolInfo: Responses['pool_metadata'] | null;
  poolGeneral: Responses['pool'] | null;
  poolHistory: PoolInfoGetHistoryYoroi[]; // | null; // | 'error' | 'empty';
}

export interface StakeRegistration {
  kind: 'StakeRegistration';
  certIndex: number;
  rewardAddress: string;
}
export interface StakeDeregistration {
  kind: 'StakeDeregistration';
  certIndex: number;
  rewardAddress: string;
}
export interface StakeDelegation {
  kind: 'StakeDelegation';
  certIndex: number;
  rewardAddress: string;
  poolKeyHash: string;
}
export interface PoolRegistration {
  kind: 'PoolRegistration';
  certIndex: number;
  poolParams: PoolParams;
}
export interface PoolRetirement {
  kind: 'PoolRetirement';
  certIndex: number;
  poolKeyHash: string;
  epoch: number;
}

export enum MirCertPot {
  Reserves = 0,
  Treasury = 1,
}

export interface Dictionary<T> {
  [key: string]: T;
}

export interface MoveInstantaneousRewardsCert {
  kind: 'MoveInstantaneousRewardsCert';
  certIndex: number;
  pot: MirCertPot;
  rewards: null | Dictionary<string>;
}

export interface PoolParams {
  operator: string;
  vrfKeyHash: string;
  pledge: string;
  cost: string;
  margin: number;
  rewardAccount: string;
  poolOwners: string[];
  relays: PoolRelay[];
  poolMetadata: null | PoolMetadata;
}

export interface PoolMetadata {
  url: string;
  metadataHash: string;
}

export interface PoolRelay {
  ipv4: string | null;
  ipv6: string | null;
  dnsName: string | null;
  dnsSrvName: string | null;
  port: string;
}

export type Certificate =
  | StakeRegistration
  | StakeDeregistration
  | StakeDelegation
  | PoolRegistration
  | PoolRetirement
  | MoveInstantaneousRewardsCert;

export interface pool_relays_single {
  /** IPv4 address of the relay */
  ipv4: string | null;
  /** IPv6 address of the relay */
  ipv6: string | null;
  /** DNS name of the relay */
  dns: string | null;
  /** DNS SRV entry of the relay */
  dns_srv: string | null;
  /** Network port of the relay */
  port: number;
}

export type AddressesResult = {
  address: string;
  data: Responses['address_content'] | 'empty';
}[];

export interface Data {
  txUtxos: Responses['tx_content_utxo'];
  txData: Responses['tx_content'];
  blockInfo: Responses['block_content'];
}

export enum BlockEra {
  Byron = 'byron',
  Shelley = 'shelley',
}

export interface TransactionFrag {
  hash: string;
  fee: string;
  ttl: string;
  blockEra: BlockEra;
  metadata: null | string;
  block: BlockFrag;
  includedAt: Date;
  inputs: TransInputFrag[];
  outputs: TransOutputFrag[]; // technically a TransactionOutput fragment
  txIndex: number;
  withdrawals: TransOutputFrag[];
  certificates: Certificate[];
}
export interface BlockFrag {
  number: number;
  hash: string;
  epochNo: number;
  slotNo: number;
}

export interface Asset {
  assetId: string;
  policyId: string;
  name: null | string;
  amount: string;
}

export interface TransInputFrag {
  address: string;
  amount: string;
  id: string;
  index: number;
  txHash: string;
  assets: Asset[];
}
export interface TransOutputFrag {
  address: string;
  amount: string;
  assets: null | Asset[];
}

export interface txsHistory {
  // information that is only present if block is included in the blockchain
  block_num: null | number;
  block_hash: null | string;
  tx_ordinal: null | number;
  time: null | string; // timestamp with timezone
  epoch: null | number;
  slot: null | number;

  // information that is always present
  type: 'byron' | 'shelley';
  hash: string;
  last_update: string; // timestamp with timezone
  tx_state: 'Successful' | 'Failed' | 'Pending';
  inputs: {
    // these will be ordered by the input transaction id asc
    address: string;
    amount: string;
    //id: string; // concatenation of txHash || index
    //index: number;
    //txHash: string;
    assets: Asset[];
  }[];
  outputs: {
    //these will be ordered by transaction index asc.
    address: string;
    amount: string;
    assets: Asset[];
  }[];
  withdrawals: {
    address: string; // hex
    amount: string;
  }[];
  certificates: Certificate[];
}
export interface Withdrawal {
  address: string;
  amount: string;
}
