import { PublicKey, Transaction, LAMPORTS_PER_SOL, ComputeBudgetProgram, sendAndConfirmTransaction } from "@solana/web3.js";
import { LightSystemProgram, createRpc, defaultTestStateTreeAccounts, Rpc, bn } from "@lightprotocol/stateless.js";
import { CompressedTokenProgram } from "@lightprotocol/compressed-token";
import { getAssociatedTokenAddress, getAccount, getMint, createAssociatedTokenAccountInstruction } from "@solana/spl-token";

export const SOLANA_DEVNET_USDC_PUBKEY = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';
const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://devnet.helius-rpc.com/?api-key=41cf9b1c-2c4f-477a-9cf6-349393ca6071';
const connection: Rpc = createRpc(rpcUrl, rpcUrl);

const computeUnitLimit = 550_000;
const computeUnitPrice = 10_000;

export const getCompressedTokens = async (owner: string, mintAddress: string) => {
    try {
        console.log("Using RPC URL:", rpcUrl);
        const accounts = await connection.getCompressedTokenAccountsByOwner(new PublicKey(owner), {
            mint: new PublicKey(mintAddress)
        });

        const deduplicatedAccounts = accounts.items.reduce((acc, current) => {
            const existingAccount = acc.find(item => item.parsed.mint.equals(current.parsed.mint));
            if (existingAccount) {
                existingAccount.parsed.amount = existingAccount.parsed.amount.add(current.parsed.amount);
            } else {
                acc.push(current);
            }
            return acc;
        }, [] as typeof accounts.items);

        console.log("Compressed token accounts:", deduplicatedAccounts);
        return deduplicatedAccounts;
    } catch (error) {
        console.error("Error fetching compressed tokens:", error);
        if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
        }
        throw new Error("Error fetching compressed tokens: " + error);
    }
};

export const buildCompressSolTx = async (payer: string, solAmount: number): Promise<Transaction> => {
    try {
        const payerPublicKey = new PublicKey(payer);
        const { blockhash } = await connection.getLatestBlockhash();

        const solBalance = await connection.getBalance(payerPublicKey);
        console.log("SOL balance:", solBalance / LAMPORTS_PER_SOL);

        if (solBalance < solAmount * LAMPORTS_PER_SOL) {
            throw new Error(`Insufficient SOL balance. Required: ${solAmount}, Available: ${solBalance / LAMPORTS_PER_SOL}`);
        }

        const compressSolIx = await LightSystemProgram.compress({
            payer: payerPublicKey,
            toAddress: payerPublicKey,
            lamports: solAmount * LAMPORTS_PER_SOL,
            outputStateTree: defaultTestStateTreeAccounts().merkleTree,
        });

        const transaction = new Transaction();

        transaction.add(
            ComputeBudgetProgram.setComputeUnitLimit({
                units: computeUnitLimit
            }),
            ComputeBudgetProgram.setComputeUnitPrice({
                microLamports: computeUnitPrice,
            }),
            compressSolIx
        );

        transaction.feePayer = payerPublicKey;
        transaction.recentBlockhash = blockhash;

        console.log("SOL Compress transaction details:", transaction);

        const simulation = await connection.simulateTransaction(transaction);
        console.log("Compress SOL transaction simulation result:", simulation);
        if (simulation.value.err) {
            throw new Error(`Transaction simulation failed: ${JSON.stringify(simulation.value.err)}`);
        }

        return transaction;
    } catch (error) {
        console.error("Error creating SOL compress transaction:", error);
        if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
        }
        throw new Error("SOL Compress Transaction creation failed: " + error);
    }
};

export const buildCompressSplTokenTx = async (payer: string, amount: number, mintAddress: string): Promise<Transaction> => {
    try {
        console.log("Building compress SPL token transaction...");
        console.log("Payer:", payer);
        console.log("Amount:", amount);
        console.log("Mint Address:", mintAddress);

        const payerPublicKey = new PublicKey(payer);
        const mintPublicKey = new PublicKey(mintAddress);

        const sourceTokenAccount = await getAssociatedTokenAddress(mintPublicKey, payerPublicKey);
        console.log("Source Token Account:", sourceTokenAccount.toBase58());

        let tokenAccountInfo;
        try {
            tokenAccountInfo = await getAccount(connection, sourceTokenAccount);
            console.log("Token Account Info:", tokenAccountInfo);
        } catch (error) {
            console.log("Token account doesn't exist, creating one...");
            const createAtaIx = createAssociatedTokenAccountInstruction(
                payerPublicKey,
                sourceTokenAccount,
                payerPublicKey,
                mintPublicKey
            );
            const { blockhash } = await connection.getLatestBlockhash();
            const createAtaTx = new Transaction().add(createAtaIx);
            createAtaTx.feePayer = payerPublicKey;
            createAtaTx.recentBlockhash = blockhash;
            await sendAndConfirmTransaction(connection, createAtaTx, []);
            tokenAccountInfo = await getAccount(connection, sourceTokenAccount);
            console.log("Created Token Account Info:", tokenAccountInfo);
        }

        const tokenBalance = Number(tokenAccountInfo.amount);
        
        const mintInfo = await getMint(connection, mintPublicKey);
        const tokenDecimals = mintInfo.decimals;
        
        const amountInBaseUnits = amount * Math.pow(10, tokenDecimals);

        console.log(`Token balance: ${tokenBalance / Math.pow(10, tokenDecimals)}`);
        console.log(`Amount to compress: ${amount}`);
        console.log(`Amount in base units: ${amountInBaseUnits}`);

        if (tokenBalance < amountInBaseUnits) {
            throw new Error(`Insufficient token balance. Required: ${amount}, Available: ${tokenBalance / Math.pow(10, tokenDecimals)}`);
        }

        const { blockhash } = await connection.getLatestBlockhash();

        const compressIx = await CompressedTokenProgram.compress({
            payer: payerPublicKey,
            owner: payerPublicKey,
            source: sourceTokenAccount,
            toAddress: payerPublicKey,
            amount: bn(amountInBaseUnits),
            mint: mintPublicKey,
        });

        console.log("Compress Instruction:", compressIx);

        const transaction = new Transaction();

        transaction.add(
            ComputeBudgetProgram.setComputeUnitLimit({
                units: computeUnitLimit
            }),
            ComputeBudgetProgram.setComputeUnitPrice({
                microLamports: computeUnitPrice,
            }),
            compressIx
        );

        transaction.feePayer = payerPublicKey;
        transaction.recentBlockhash = blockhash;

        console.log("SPL Token Compress transaction details:", transaction);

        const simulation = await connection.simulateTransaction(transaction);
        console.log("Compress SPL token transaction simulation result:", JSON.stringify(simulation, null, 2));
        
        if (simulation.value.err) {
            console.error("Simulation error:", simulation.value.err);
            throw new Error(`Transaction simulation failed: ${JSON.stringify(simulation.value.err)}`);
        }

        return transaction;
    } catch (error) {
        console.error("Error creating SPL token compress transaction:", error);
        if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
        }
        throw new Error("Compress SPL Token Transaction creation failed: " + error);
    }
};

export async function getTokenBalance(publicKey: PublicKey, mintAddress: string): Promise<number> {
    try {
        const mintPublicKey = new PublicKey(mintAddress);
        const tokenAccount = await getAssociatedTokenAddress(mintPublicKey, publicKey);
        
        let accountInfo;
        try {
            accountInfo = await getAccount(connection, tokenAccount);
        } catch (error) {
            console.log("Token account doesn't exist. Balance is 0.");
            return 0;
        }
        
        const mintInfo = await getMint(connection, mintPublicKey);
        
        return Number(accountInfo.amount) / Math.pow(10, mintInfo.decimals);
    } catch (error) {
        console.error("Error fetching token balance:", error);
        return 0;
    }
}