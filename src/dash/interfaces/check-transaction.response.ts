export interface CheckTransactionDetail {
  account: string;
  address: string;
  category: string;
  amount: number;
  label: string;
  vout: number;
  fee?:number
  abandoned?:boolean
}

export interface CheckTransactionResponse {
  amount: number;
  fee?:number
  confirmations: number;
  blockhash: string;
  blockindex: number;
  blocktime: number;
  txid: string;
  walletconflicts: any[];
  time: number;
  timereceived: number;
  comment?:string
  to?:string
  details: CheckTransactionDetail[];
  hex: string;
}
