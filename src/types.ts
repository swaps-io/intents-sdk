export type Address = `0x${string}`

export interface Intent {
    module: string
    id: string
    project: string
    protocol: string
    name: string
    iconURL: string
    TVL?: bigint // in USD
    APR?: bigint
    APY?: bigint
    chainId: number
    tokenIn?: string // address
    minAmountIn?: bigint
    maxAmountIn?: bigint
    pool?: string // address
    tokenOut: string // address
    rewardTokens?: string[] // addresses of reward tokens
    raw: any // raw data from each protocol, for checks and logging
}

export type IntentsMap = { [key: string]: Intent }

export interface Position {
    intent: Intent
    userAddress: string
    token: string // address of the token in which amount is issued
    amount: bigint // How much token the user has in the position
    decimals?: number
    price?: number
    raw: any // raw data from each protocol, for checks and logging
}

export interface Tx {
    data: string
    to: string
    from: string
    value: string
}

export interface Quote {
    gas?: number
    priceImpact?: bigint
    tokenOut: string;
    amountOut: bigint
    createdAtBlock: number
    // tokenOut: string; // address
    fee?: bigint
    feeToken?: string // address
    tx: Tx // transaction data for execution
    raw?: any // raw data for debugging
    // For reference
    intent: Intent
    intentInputData?: OpenPositionData
    position?: Position
    closePositionData?: ClosePositionData
    fromAddress: string
    receiver: string
    spender: string
}

export interface OpenPositionData {
    userAddress: string // address
    receiver?: string // address
    spender?: string // address
    amountIn: bigint
    slippage?: number
    minAmountOut?: bigint
    tokenIn: string // address
}

export interface ClosePositionData {
    receiver: string
    spender: string
    slippage?: number
    minAmountOut?: bigint
    tokenOut: string // address
}

export interface IntentsModule {
    id: string // module slug
    getAllIntents(): Promise<Intent[]>

    quoteIntent(intent: Intent, intentInputData: any): Promise<Quote>

    getUserPositions(chainId: number, userAddress: string): Promise<Position[]>

    quoteClosePosition(position: Position, closePositionData: any): Promise<Quote>

    // TODO Claim / Harvest
}
