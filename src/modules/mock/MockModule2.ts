import { Intent, IntentsModule, Position, Quote } from "../../types";

export class MockModule2 implements IntentsModule {
  id: string = "mock-module-2";

  async getAllIntents(): Promise<Intent[]> {
    return [
      {
        module: this.id,
        id: "stake-matic",
        protocol: "MockProtocol2",
        name: "Stake MATIC",
        iconURL: "https://example.com/matic-icon.png",
        TVL: BigInt(500000000000000000000n), // 500 MATIC
        APR: BigInt(850), // 8.5%
        APY: BigInt(887), // 8.87%
        chainId: BigInt(137), // Polygon
        tokenIn: "0x0000000000000000000000000000000000001010", // MATIC
        minAmountIn: BigInt(10000000000000000000n), // 10 MATIC
        maxAmountIn: BigInt(10000000000000000000000n), // 10000 MATIC
        tokenOut: "0x7777777777777777777777777777777777777777", // stMATIC mock
        rewardTokens: ["0x8888888888888888888888888888888888888888"], // Reward token mock
        raw: {
          poolId: "mock-pool-id-3",
          protocol: "mock2",
          extraData: "Some extra data for protocol 2"
        }
      },
      {
        module: this.id,
        id: "limit-order-btc-eth",
        protocol: "MockProtocol2",
        name: "BTC-ETH Limit Order",
        iconURL: "https://example.com/btc-eth-icon.png",
        chainId: BigInt(1), // Ethereum Mainnet
        tokenIn: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // WBTC
        minAmountIn: BigInt(1000000), // 0.01 BTC (8 decimals)
        maxAmountIn: BigInt(1000000000), // 10 BTC
        pool: "0x9999999999999999999999999999999999999999",
        tokenOut: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
        rewardTokens: [],
        raw: {
          poolId: "mock-pool-id-4",
          protocol: "mock2",
          limitPrice: "16.5", // 1 BTC = 16.5 ETH
          extraData: "Some extra data for limit order"
        }
      }
    ];
  }

  async quoteIntent(intent: Intent, intentInputData: any): Promise<Quote> {
    // Simulate a quote calculation
    const amountIn = BigInt(intentInputData.amountIn || 0);
    
    if (amountIn <= 0n) {
      throw new Error("Amount must be greater than 0");
    }
    
    // Different exchange rates based on intent
    let estimatedOut: bigint;
    let fee: bigint;
    
    if (intent.id === "stake-matic") {
      // 1:1 exchange rate with 0.5% fee
      fee = amountIn * BigInt(5) / BigInt(1000);
      estimatedOut = amountIn - fee;
    } else if (intent.id === "limit-order-btc-eth") {
      // BTC to ETH at rate 1:16.5 with 0.3% fee
      estimatedOut = amountIn * BigInt(165) / BigInt(10); // 16.5 multiplier
      fee = estimatedOut * BigInt(3) / BigInt(1000);
      estimatedOut = estimatedOut - fee;
    } else {
      throw new Error("Unknown intent");
    }
    
    return {
      estimatedOut,
      tokenOut: intent.tokenOut,
      fee,
      feeToken: intent.id === "limit-order-btc-eth" ? intent.tokenOut : intent.tokenIn,
      slippage: BigInt(50), // 0.5%
      txData: "0xfedcba9876543210", // Mock transaction data
      raw: {
        intent: intent.id,
        inputAmount: amountIn.toString(),
        outputAmount: estimatedOut.toString(),
        protocol: "MockProtocol2"
      }
    };
  }

  async getUserPositions(chainId: bigint, userAddress: string): Promise<Position[]> {
    const intents = await this.getAllIntents();
    
    // Filter intents by chain ID
    const chainIntents = intents.filter(intent => intent.chainId === chainId);
    
    if (chainIntents.length === 0) {
      return [];
    }
    
    // Mock user positions - assuming user has position in the first intent of the chain
    return [
      {
        intent: chainIntents[0],
        value: chainId === BigInt(137) 
          ? BigInt(100000000000000000000n) // 100 MATIC
          : BigInt(5000000), // 0.05 BTC
        valueToken: chainIntents[0].tokenOut,
        raw: {
          positionId: `mock2-position-${chainId.toString()}`,
          timestamp: Date.now(),
          userAddress,
          chainId: chainId.toString()
        }
      }
    ];
  }

  async quoteClosePosition(position: Position): Promise<Quote> {
    // Simulate a withdrawal quote
    const protocol = position.intent.protocol;
    let estimatedOut: bigint;
    let fee: bigint;
    
    if (protocol === "MockProtocol2") {
      // 0.3% exit fee
      fee = position.value * BigInt(3) / BigInt(1000);
      estimatedOut = position.value - fee;
    } else {
      // Default 0.5% exit fee
      fee = position.value * BigInt(5) / BigInt(1000);
      estimatedOut = position.value - fee;
    }
    
    return {
      estimatedOut,
      tokenOut: position.intent.tokenIn, // Return original token
      fee,
      feeToken: position.intent.tokenIn,
      slippage: BigInt(50), // 0.5%
      txData: "0x0123456789abcdef", // Mock transaction data
      raw: {
        positionId: position.raw.positionId,
        inputAmount: position.value.toString(),
        outputAmount: estimatedOut.toString(),
        protocol: position.intent.protocol
      }
    };
  }
}