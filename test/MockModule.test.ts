import { test, assert, describe, beforeEach } from "vitest";
import { MockModule } from "../src";

describe("MockModule", () => {
  let mockModule: MockModule;

  beforeEach(() => {
    mockModule = new MockModule();
  });

  test("returns intents", async () => {
    const intents = await mockModule.getAllIntents();
    assert.equal(intents.length, 2);
    assert.equal(intents[0].module, "mock-module");
    assert.equal(intents[0].protocol, "MockProtocol");
  });

  test("quoteIntent calculations", async () => {
    const intents = await mockModule.getAllIntents();
    
    // Test with valid input
    const quote = await mockModule.quoteIntent(intents[0], { amountIn: "1000000000000000000" }); // 1 ETH
    assert.equal(quote.estimatedOut, BigInt("990000000000000000")); // 0.99 ETH (1% fee)
    assert.equal(quote.fee, BigInt("10000000000000000")); // 0.01 ETH
    
    // Test with missing amountIn (should default to 0, then throw)
    try {
      await mockModule.quoteIntent(intents[0], {});
      assert.fail("Should have thrown an error");
    } catch (error: any) {
      assert.equal(error.message, "Amount must be greater than 0");
    }
    
    // Test with zero input should throw
    try {
      await mockModule.quoteIntent(intents[0], { amountIn: "0" });
      assert.fail("Should have thrown an error");
    } catch (error: any) {
      assert.equal(error.message, "Amount must be greater than 0");
    }
  });

  test("getUserPositions returns positions for user", async () => {
    const positions = await mockModule.getUserPositions(BigInt(1), "0xUser");
    
    assert.equal(positions.length, 1);
    assert.equal(positions[0].value, BigInt("500000000000000000")); // 0.5 ETH
    assert.equal(positions[0].raw.userAddress, "0xUser");
  });
  
  test("quoteClosePosition calculates withdrawal quote", async () => {
    const positions = await mockModule.getUserPositions(BigInt(1), "0xUser");
    const position = positions[0];
    
    const quote = await mockModule.quoteClosePosition(position);
    
    // Check 1% exit fee
    const expectedFee = position.value * BigInt(1) / BigInt(100);
    const expectedOut = position.value - expectedFee;
    
    assert.equal(quote.estimatedOut, expectedOut);
    assert.equal(quote.fee, expectedFee);
    assert.equal(quote.tokenOut, position.intent.tokenIn);
  });
});