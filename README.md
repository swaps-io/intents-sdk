# Swaps.io Intents SDK

[![npm version](https://badgen.net/npm/v/intents-sdk)](https://npm.im/intents-sdk) [![npm downloads](https://badgen.net/npm/dm/intents-sdk)](https://npm.im/intents-sdk)

## Overview

The Intents SDK provides a standardized interface for working with trading intents across various DeFi protocols. It allows you to discover intents, quote them, manage positions, and more through a unified API.

## Install

```bash
npm install intents-sdk
# or
yarn add intents-sdk
# or
pnpm add intents-sdk
```

## Basic Usage

```typescript
import { IntentsManager, MockModule } from 'intents-sdk';

// Create modules
const mockModule = new MockModule();

// Initialize the IntentsManager with modules
const intentsManager = new IntentsManager({
  modules: [mockModule]
});

// Example: Get all available intents
async function getAllAvailableIntents() {
  const intents = await intentsManager.getAllIntents();
  console.log('Available intents:', intents);
  return intents;
}

// Example: Quote an intent
async function quoteExampleIntent() {
  const intents = await intentsManager.getAllIntents();
  const exampleIntent = intents[0]; // Take the first intent
  
  const quote = await intentsManager.quoteIntent(exampleIntent, {
    userAddress: '0xYourAddress',
    amountIn: 1000000000000000000n, // 1 ETH in wei
    tokenIn: exampleIntent.tokenIn
  });
  
  console.log('Quote:', quote);
  return quote;
}

// Example: Get user positions
async function getUserPositions() {
  const positions = await intentsManager.getUserPositions(
    1, // chainId (Ethereum mainnet)
    '0xYourAddress'
  );
  
  console.log('User positions:', positions);
  return positions;
}
```

## Modules

The SDK consists of modular components that provide functionality for different protocols:

- **IntentsManager**: Core module that manages all protocol-specific modules
- **MockModule**: Example module for testing and development

## API Reference

### IntentsManager

The central manager for all protocol-specific modules.

```typescript
// Initialize
const manager = new IntentsManager({ modules: [...] });

// Core Methods
await manager.getAllIntents();
await manager.getIntentsByChain(chainId);
await manager.getIntentsByProtocol(protocol);
await manager.getSupportedProtocols();
await manager.quoteIntent(intent, intentInputData);
await manager.getUserPositions(chainId, userAddress);
await manager.quoteClosePosition(position, closePositionData);

// Module Management
manager.getModules();
manager.getModule(moduleId);
manager.registerModule(module);
manager.unregisterModule(moduleId);
```

### Core Types

```typescript
interface Intent {
  module: string;
  id: string;
  project: string;
  protocol: string;
  name: string;
  iconURL: string;
  TVL?: bigint;
  APR?: bigint;
  APY?: bigint;
  chainId: number;
  tokenIn?: string;
  minAmountIn?: bigint;
  maxAmountIn?: bigint;
  pool?: string;
  tokenOut: string;
  rewardTokens?: string[];
  raw: any;
}

interface Position {
  intent: Intent;
  userAddress: string;
  token: string;
  amount: bigint;
  decimals?: number;
  price?: number;
  raw: any;
}

interface Quote {
  intent: Intent;
  fromAddress: string;
  receiver: string;
  spender: string;
  gas?: number;
  priceImpact?: bigint;
  tokenOut: string;
  amountOut: bigint;
  createdAtBlock: number;
  fee?: bigint;
  feeToken?: string;
  tx: Tx;
  raw?: any;
}
```

## Development

```bash
# Install dependencies
pnpm install

# Build the SDK
pnpm build

# Run tests
pnpm test
```

## License

MIT
