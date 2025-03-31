export interface Intent {
  module: string;
  id: string;
  protocol: string;
  name: string;
  iconURL: string;
  TVL?: bigint;
  APR?: bigint;
  APY?: bigint;
  chainId: bigint;
  tokenIn: string; // address
  minAmountIn: bigint;
  maxAmountIn: bigint;
  pool?: string; // address
  tokenOut: string; // address
  rewardTokens: string[]; // addresses of reward tokens
  raw: any; // raw data from each protocol, for checks and logging
  [key: string]: any; // additional fields for quick prototyping
}

export interface Position {
  intent: Intent;
  value: bigint; // How much token the user has in the position
  valueToken: string; // address of the token in which value is issued
  raw: any; // raw data from each protocol, for checks and logging
  [key: string]: any; // additional fields for quick prototyping
}

export interface Quote {
  estimatedOut: bigint;
  tokenOut: string; // address
  fee?: bigint;
  feeToken?: string; // address
  slippage?: bigint;
  txData?: string; // transaction data for execution
  raw?: any; // raw data for debugging
}

export interface IntentsModule {
  id: string; // module slug
  getAllIntents(): Promise<Intent[]>;
  quoteIntent(intent: Intent, intentInputData: any): Promise<Quote>;
  getUserPositions(chainId: bigint, userAddress: string): Promise<Position[]>;
  quoteClosePosition(position: Position): Promise<Quote>;
}