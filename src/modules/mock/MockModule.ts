import { Intent, IntentsModule, Position, Quote } from "../../types";

export class MockModule implements IntentsModule {
  id: string = "mock-module";

  async getAllIntents(): Promise<Intent[]> {
    return [
      {
        module: this.id,
        id: "stake-eth",
        protocol: "MockProtocol",
        name: "Stake ETH",
        iconURL: "https://example.com/eth-icon.png",
        TVL: BigInt(1000000000000000000000n), // 1000 ETH
        APR: BigInt(500), // 5%
        APY: BigInt(513), // 5.13%
        chainId: BigInt(1), // Ethereum Mainnet
        tokenIn: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // ETH
        minAmountIn: BigInt(100000000000000000n), // 0.1 ETH
        maxAmountIn: BigInt(100000000000000000000n), // 100 ETH
        tokenOut: "0x1111111111111111111111111111111111111111", // stETH mock
        rewardTokens: ["0x2222222222222222222222222222222222222222"], // Reward token mock
        raw: {
          poolId: "mock-pool-id-1",
          protocol: "mock",
          extraData: "Some extra data"
        }
      },
      {
        module: this.id,
        id: "looping-usdc",
        protocol: "MockProtocol",
        name: "USDC Looping",
        iconURL: "https://example.com/usdc-icon.png",
        TVL: BigInt(5000000000000n), // 5M USDC
        APR: BigInt(800), // 8%
        APY: BigInt(832), // 8.32%
        chainId: BigInt(1), // Ethereum Mainnet
        tokenIn: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
        minAmountIn: BigInt(1000000n), // 1 USDC
        maxAmountIn: BigInt(1000000000000n), // 1M USDC
        pool: "0x3333333333333333333333333333333333333333",
        tokenOut: "0x4444444444444444444444444444444444444444", // LP token mock
        rewardTokens: [
          "0x5555555555555555555555555555555555555555",
          "0x6666666666666666666666666666666666666666"
        ],
        raw: {
          poolId: "mock-pool-id-2",
          protocol: "mock",
          leverage: 2,
          extraData: "Some extra data"
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
    
    // Simple mock - 1:1 exchange rate with 1% fee
    const fee = amountIn * BigInt(1) / BigInt(100);
    const estimatedOut = amountIn - fee;
    
    return {
      estimatedOut,
      tokenOut: intent.tokenOut,
      fee,
      feeToken: intent.tokenIn,
      slippage: BigInt(100), // 1%
      txData: "0x1234567890abcdef", // Mock transaction data
      raw: {
        intent: intent.id,
        inputAmount: amountIn.toString(),
        outputAmount: estimatedOut.toString(),
        protocol: "MockProtocol"
      }
    };
  }

  async getUserPositions(chainId: bigint, userAddress: string): Promise<Position[]> {
    const intents = await this.getAllIntents();
    
    // Mock user positions - assuming user has position in first intent
    return [
      {
        intent: intents[0],
        value: BigInt(500000000000000000n), // 0.5 ETH
        valueToken: intents[0].tokenOut,
        raw: {
          positionId: "mock-position-1",
          timestamp: Date.now(),
          userAddress,
          chainId: chainId.toString()
        }
      }
    ];
  }

  async quoteClosePosition(position: Position): Promise<Quote> {
    // Simulate a withdrawal quote
    const estimatedOut = position.value * BigInt(99) / BigInt(100); // 1% exit fee
    const fee = position.value - estimatedOut;
    
    return {
      estimatedOut,
      tokenOut: position.intent.tokenIn, // Return original token
      fee,
      feeToken: position.intent.tokenIn,
      slippage: BigInt(100), // 1%
      txData: "0xabcdef1234567890", // Mock transaction data
      raw: {
        positionId: position.raw.positionId,
        inputAmount: position.value.toString(),
        outputAmount: estimatedOut.toString(),
        protocol: position.intent.protocol
      }
    };
  }
}