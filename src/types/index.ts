import { Responses } from '@blockfrost/blockfrost-js';

export interface A {
  b: string;
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

interface Asset {
  unit: string;
  quantity: string;
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
    reward: string | null; // FIXME: null will be fixed in https://github.com/blockfrost/openapi/pull/56
    poolHash: string;
  }[];
}

export interface AccountRewardHistoryEpochContentYoroi {
  epoch: number;
  reward: string | null; // FIXME: null will be fixed in https://github.com/blockfrost/openapi/pull/56
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
