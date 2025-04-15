// import { test, assert, describe, beforeEach } from "vitest";
// import {
//   IntentsManager,
//   MockModule,
//   MockModule2
// } from "../src";
//
// describe("IntentsManager", () => {
//   let mockModule: MockModule;
//   let mockModule2: MockModule2;
//   let manager: IntentsManager;
//
//   beforeEach(() => {
//     mockModule = new MockModule();
//     mockModule2 = new MockModule2();
//     manager = new IntentsManager({
//       modules: [mockModule, mockModule2]
//     });
//   });
//
//   test("aggregates all intents", async () => {
//     const intents = await manager.getAllIntents();
//     assert.equal(intents.length, 4);
//   });
//
//   test("filters intents by chain", async () => {
//     const ethereumIntents = await manager.getIntentsByChain(BigInt(1));
//     assert.equal(ethereumIntents.length, 3);
//
//     const polygonIntents = await manager.getIntentsByChain(BigInt(137));
//     assert.equal(polygonIntents.length, 1);
//     assert.equal(polygonIntents[0].name, "Stake MATIC");
//   });
//
//   test("quotes intent", async () => {
//     const intents = await mockModule.getAllIntents();
//     const intent = intents[0];
//
//     const quote = await manager.quoteIntent(intent, { amountIn: "1000000000000000000" }); // 1 ETH
//
//     assert.ok(quote.amountOut);
//     assert.equal(quote.tokenOut, intent.tokenOut);
//     assert.ok(quote.fee);
//   });
//
//   test("gets user positions", async () => {
//     const positions = await manager.getUserPositions(BigInt(1), "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
//
//     assert.ok(positions.length > 0);
//     assert.equal(positions[0].intent.chainId, BigInt(1));
//   });
//
//   test("quotes position closing", async () => {
//     const positions = await mockModule.getUserPositions(BigInt(1), "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
//     const position = positions[0];
//
//     const quote = await manager.quoteClosePosition(position);
//
//     assert.ok(quote.amountOut);
//     assert.equal(quote.tokenOut, position.intent.tokenIn);
//   });
//
//   test("filters by protocol", async () => {
//     const mockProtocolIntents = await manager.getIntentsByProtocol("MockProtocol");
//     assert.equal(mockProtocolIntents.length, 2);
//
//     const mockProtocol2Intents = await manager.getIntentsByProtocol("MockProtocol2");
//     assert.equal(mockProtocol2Intents.length, 2);
//   });
//
//   test("lists supported protocols", async () => {
//     const protocols = await manager.getSupportedProtocols();
//     assert.equal(protocols.length, 2);
//     assert.ok(protocols.includes("MockProtocol"));
//     assert.ok(protocols.includes("MockProtocol2"));
//   });
//
//   test("module registration and retrieval", () => {
//     assert.equal(manager.getModules().length, 2);
//
//     const retrievedModule = manager.getModule("mock-module");
//     assert.ok(retrievedModule);
//     assert.equal(retrievedModule.id, "mock-module");
//
//     // Test unregistering a module
//     const result = manager.unregisterModule("mock-module");
//     assert.equal(result, true);
//     assert.equal(manager.getModules().length, 1);
//     assert.equal(manager.getModule("mock-module"), undefined);
//
//     // Test re-registering a module
//     manager.registerModule(mockModule);
//     assert.equal(manager.getModules().length, 2);
//   });
//
//   test("throws error for non-existent module", async () => {
//     const intents = await mockModule.getAllIntents();
//     const position = (await mockModule.getUserPositions(BigInt(1), "0xUser"))[0];
//
//     // Modify the intent to have a non-existent module
//     const invalidIntent = { ...intents[0], module: "non-existent-module" };
//     const invalidPosition = { ...position, intent: invalidIntent };
//
//     // Test quoteIntent
//     try {
//       await manager.quoteIntent(invalidIntent, { amountIn: "1000" });
//       assert.fail("Should have thrown an error");
//     } catch (error: any) {
//       assert.equal(error.message, "Module not found: non-existent-module");
//     }
//
//     // Test quoteClosePosition
//     try {
//       await manager.quoteClosePosition(invalidPosition);
//       assert.fail("Should have thrown an error");
//     } catch (error: any) {
//       assert.equal(error.message, "Module not found: non-existent-module");
//     }
//   });
// });
