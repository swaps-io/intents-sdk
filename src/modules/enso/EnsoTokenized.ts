import {ClosePositionData, Intent, IntentsMap, IntentsModule, Position, Quote} from "../../types";
import { EnsoClient } from "@ensofinance/sdk";
import ensoRawIntents from "./EnsoRawTokenizedIntents.json";
import 'dotenv/config';
import {Address, OpenPositionData} from "../../types";

export class EnsoTokenizedModule implements IntentsModule {
    id: string = "enso";
    ensoClient: EnsoClient;

    chains: number[] = [];
    intents: Intent[];
    intentsByAddress: IntentsMap;

    constructor(ensoApiKey?: string) {
        const apiKey = ensoApiKey ?? process.env.ENSO_API_KEY;
        if (!apiKey) {
            throw new Error("ENSO_API_KEY needed");
        }
        this.ensoClient = new EnsoClient({ apiKey });
        this.intents = ensoRawIntents.map(this.rawToIntent.bind(this));
        this.intentsByAddress = this.intents.reduce((acc: IntentsMap, intent) => {
            acc[intent.raw.address as string] = intent;
            return acc;
        }, {});

        this.chains = ensoRawIntents.map(r => r.chainId);
    }

    rawToIntent(r: any): Intent {
        return {
            module: this.id,
            id: r.address, // id in ENSO is crypto token address
            project: r.project,
            protocol: r.protocol,
            name: r.name,
            iconURL: r.logosUri[0],
            TVL: r.tvl,
            APR: undefined,
            APY: r.apy,
            chainId: r.chainId,
            tokenIn: undefined, // Any token in
            minAmountIn: undefined, // any
            maxAmountIn: undefined, // any
            tokenOut: r.address,
            rewardTokens: undefined, // no Reward tokens
            raw: r
        }
    }

    async getAllIntents(): Promise<Intent[]> {
        return this.intents;
    }

    async quoteIntent(intent: Intent, intentInputData: OpenPositionData): Promise<Quote> {
        const i = intentInputData;
        const fromAddress = i.userAddress as Address;
        const receiver = i.receiver ?? i.userAddress;
        const spender = i.spender ?? i.userAddress;
        const tokenOut = intent.raw.address as Address;

        const q = await this.ensoClient.getRouterData({
            fromAddress: fromAddress as Address,
            receiver: receiver as Address,
            spender: spender as Address,
            chainId: intent.chainId,
            amountIn: i.amountIn.toString(),
            slippage: i.slippage,
            minAmountOut: i.minAmountOut?.toString(),
            tokenIn: i.tokenIn as Address,
            tokenOut: tokenOut as Address,
            routingStrategy: "delegate", // Use Smart Wallet delegate calls
        });

        const priceImpact = q.priceImpact ? BigInt(q.priceImpact) : undefined;
        return {
            intent,
            fromAddress,
            receiver,
            spender,
            intentInputData,
            tx: q.tx,
            gas: Number(q.gas),
            priceImpact,
            tokenOut,
            amountOut: BigInt(q.amountOut),
            createdAtBlock: q.createdAt,
            raw: q,
        }
    }

    async getUserPositions(chainId: number, userAddress: string): Promise<Position[]> {
        const allBalances = await this.ensoClient.getBalances({
            eoaAddress: userAddress as Address,
            chainId: chainId,
        });

        // filter balances to have only intents by addresses
        const balances = allBalances.filter(
            b => this.intentsByAddress[b.token]
        );

        // map found balances to intents and generate positions
        const positions: Position[] = balances.map(balance => {
            const intent = this.intentsByAddress[balance.token];
            return {
                intent,
                userAddress,
                token: balance.token,
                amount: BigInt(balance.amount),
                decimals: balance.decimals,
                price: Number(balance.price),
                raw: balance
            };
        });

        return positions;
    }

    async quoteClosePosition(position: Position, closePositionData: ClosePositionData): Promise<Quote> {
        const c = closePositionData;
        // TODO change to non-tokenized router data
        const fromAddress = position.userAddress as Address;
        const receiver = c.receiver ?? fromAddress;
        const spender = c.spender ?? fromAddress;
        const q = await this.ensoClient.getRouterData({
            fromAddress: fromAddress as Address,
            receiver: receiver as Address,
            spender: spender as Address,
            chainId: position.intent.chainId,
            amountIn: position.amount.toString(),
            slippage: c.slippage,
            minAmountOut: c.minAmountOut?.toString(),
            tokenIn: position.token as Address,
            tokenOut: c.tokenOut as Address,
            routingStrategy: "delegate", // Use Smart Wallet delegate calls
        });

        const priceImpact = q.priceImpact ? BigInt(q.priceImpact) : undefined;
        return {
            position,
            intent: position.intent,
            closePositionData,
            fromAddress,
            receiver,
            spender,
            tx: q.tx,
            gas: Number(q.gas),
            priceImpact,
            tokenOut: c.tokenOut,
            amountOut: BigInt(q.amountOut),
            createdAtBlock: q.createdAt,
            raw: q,
        }
    }
}
