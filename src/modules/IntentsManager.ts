// import { Intent, IntentsModule, Position, Quote } from "../types";
//
// export interface IntentsManagerOptions {
//   modules: IntentsModule[];
// }
//
// export class IntentsManager implements IntentsModule {
//   id: string = "intents-manager";
//   private modules: Map<string, IntentsModule> = new Map();
//
//   constructor(options: IntentsManagerOptions) {
//     // Register all modules
//     for (const module of options.modules) {
//       this.modules.set(module.id, module);
//     }
//   }
//
//   /**
//    * Get all registered modules
//    */
//   getModules(): IntentsModule[] {
//     return Array.from(this.modules.values());
//   }
//
//   /**
//    * Get a specific module by ID
//    */
//   getModule(moduleId: string): IntentsModule | undefined {
//     return this.modules.get(moduleId);
//   }
//
//   /**
//    * Register a new module
//    */
//   registerModule(module: IntentsModule): void {
//     this.modules.set(module.id, module);
//   }
//
//   /**
//    * Unregister a module by ID
//    */
//   unregisterModule(moduleId: string): boolean {
//     return this.modules.delete(moduleId);
//   }
//
//   /**
//    * Get all intents from all registered modules
//    */
//   async getAllIntents(): Promise<Intent[]> {
//     const allIntentsPromises = Array.from(this.modules.values()).map(module =>
//       module.getAllIntents()
//     );
//
//     const allIntentsArrays = await Promise.all(allIntentsPromises);
//     return allIntentsArrays.flat();
//   }
//
//   /**
//    * Get all intents for a specific chain from all registered modules
//    */
//   async getIntentsByChain(chainId: bigint): Promise<Intent[]> {
//     const allIntents = await this.getAllIntents();
//     return allIntents.filter(intent => intent.chainId === chainId);
//   }
//
//   /**
//    * Quote an intent - forwards to the appropriate module
//    */
//   async quoteIntent(intent: Intent, intentInputData: any): Promise<Quote> {
//     const module = this.modules.get(intent.module);
//
//     if (!module) {
//       throw new Error(`Module not found: ${intent.module}`);
//     }
//
//     return module.quoteIntent(intent, intentInputData);
//   }
//
//   /**
//    * Get all user positions across all modules
//    */
//   async getUserPositions(chainId: bigint, userAddress: string): Promise<Position[]> {
//     const positionsPromises = Array.from(this.modules.values()).map(module =>
//       module.getUserPositions(chainId, userAddress)
//     );
//
//     const positionsArrays = await Promise.all(positionsPromises);
//     return positionsArrays.flat();
//   }
//
//   /**
//    * Quote closing a position - forwards to the appropriate module
//    */
//   async quoteClosePosition(position: Position): Promise<Quote> {
//     const module = this.modules.get(position.intent.module);
//
//     if (!module) {
//       throw new Error(`Module not found: ${position.intent.module}`);
//     }
//
//     return module.quoteClosePosition(position);
//   }
//
//   /**
//    * Get intents by protocol
//    */
//   async getIntentsByProtocol(protocol: string): Promise<Intent[]> {
//     const allIntents = await this.getAllIntents();
//     return allIntents.filter(intent => intent.protocol === protocol);
//   }
//
//   /**
//    * Get all supported protocols across all modules
//    */
//   async getSupportedProtocols(): Promise<string[]> {
//     const allIntents = await this.getAllIntents();
//     const protocols = new Set<string>();
//
//     allIntents.forEach(intent => {
//       protocols.add(intent.protocol);
//     });
//
//     return Array.from(protocols);
//   }
// }
