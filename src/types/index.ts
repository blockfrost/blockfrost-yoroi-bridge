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

export interface accountRegistrationHistoryResult {
  slot: number;
  txIndex: number;
  certIndex: number;
  certType: string;
  //certType: 'StakeRegistration' | 'StakeDeregistration';
}

export interface accountRegistrationHistoryYoroi {
  string: {
    slot: number;
    txIndex: number;
    certIndex: number;
    //certType: string;
    certType: 'StakeRegistration' | 'StakeDeregistration';
  }; //[]
}

export interface account_registration_content_single {
  /** Hash of the transaction containing the (de)registration certificate */
  tx_hash: string;
  /** Action in the certificate */
  action: 'registered' | 'deregistered';
}
