import { test, assert, describe, beforeEach } from "vitest";
import { MockModule2 } from "../src";

describe("MockModule2", () => {
  let mockModule2: MockModule2;

  beforeEach(() => {
    mockModule2 = new MockModule2();
  });

  test("returns intents", async () => {
    const intents = await mockModule2.getAllIntents();
    assert.equal(intents.length, 2);
    assert.equal(intents[0].module, "mock-module-2");
    assert.equal(intents[0].protocol, "MockProtocol2");
  });

  test("quoteIntent with different intent types", async () => {
    const intents = await mockModule2.getAllIntents();
    
    // Test stake-matic intent
    const maticIntent = intents.find(i => i.id === "stake-matic")!;
    const maticQuote = await mockModule2.quoteIntent(maticIntent, { amountIn: "100000000000000000000" }); // 100 MATIC
    
    // Check that the fee is 0.5% of the input amount (100 MATIC)
    const expectedFee = BigInt("100000000000000000000") * BigInt(5) / BigInt(1000);
    assert.equal(maticQuote.fee, expectedFee); 
    
    // Check that estimated output is input minus fee
    const expectedOut = BigInt("100000000000000000000") - expectedFee;
    assert.equal(maticQuote.estimatedOut, expectedOut);
    
    // Test limit-order intent
    const limitIntent = intents.find(i => i.id === "limit-order-btc-eth")!;
    const limitQuote = await mockModule2.quoteIntent(limitIntent, { amountIn: "100000000" }); // 1 BTC
    
    // 1 BTC = 16.5 ETH at rate calculation from MockModule2:
    // estimatedOut = amountIn * BigInt(165) / BigInt(10) - fee
    const btcExpectedRawOut = BigInt("100000000") * BigInt(165) / BigInt(10);
    const btcExpectedFee = btcExpectedRawOut * BigInt(3) / BigInt(1000);
    const btcExpectedOut = btcExpectedRawOut - btcExpectedFee;
    
    assert.equal(limitQuote.estimatedOut, btcExpectedOut);
  });

  test("getUserPositions filters by chain", async () => {
    // Test Polygon chain
    const polygonPositions = await mockModule2.getUserPositions(BigInt(137), "0xUser");
    assert.equal(polygonPositions.length, 1);
    assert.equal(polygonPositions[0].value, BigInt("100000000000000000000")); // 100 MATIC
    
    // Test Ethereum chain
    const ethPositions = await mockModule2.getUserPositions(BigInt(1), "0xUser");
    assert.equal(ethPositions.length, 1);
    assert.equal(ethPositions[0].value, BigInt("5000000")); // 0.05 BTC
    
    // Test unsupported chain
    const bscPositions = await mockModule2.getUserPositions(BigInt(56), "0xUser");
    assert.equal(bscPositions.length, 0);
  });
  
  test("quoteClosePosition varies by protocol", async () => {
    // Test position from MockProtocol2
    const position = (await mockModule2.getUserPositions(BigInt(137), "0xUser"))[0];
    const quote = await mockModule2.quoteClosePosition(position);
    
    // Should be 0.3% fee for MockProtocol2
    const expectedFee = position.value * BigInt(3) / BigInt(1000);
    const expectedOut = position.value - expectedFee;
    
    assert.equal(quote.fee, expectedFee);
    assert.equal(quote.estimatedOut, expectedOut);
  });
});