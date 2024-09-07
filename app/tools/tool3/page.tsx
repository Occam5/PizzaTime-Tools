import react from "react";
import bs58 from "bs58";
// import { generateKeypair } from "@/payer01.json";
import { createJupiterApiClient, DefaultApi, QuoteGetRequest, QuoteResponse, SwapRequest } from "@jup-ag/api";
import { getQuote, getQuoteFromJupiter, getSwapTransactionFromJupiter } from "@/components/JupiterSwapt";
import { Connection, LAMPORTS_PER_SOL, PublicKey, VersionedTransaction } from "@solana/web3.js";
import { loadKeypair } from "@/lib/loadkeypair";
import { NATIVE_MINT } from "@solana/spl-token";
import { rpcSimulateTransaction } from "@/components/SimulateTransaction";
// import { NATIVE_Mint } from "@solana/spl-token"

async function main() {
    const endpoint =
    // "https://devnet.helius-rpc.com/?api-key=0422440e-2b28-48a5-8683-fb4de54ee525";
    "https://mainnet.helius-rpc.com/?api-key=0422440e-2b28-48a5-8683-fb4de54ee525";
    // console.log("Hello via Bun!");
    const connection = new Connection(endpoint,"confirmed");

const wallet = loadKeypair();
console.log(wallet.publicKey.toBase58());
// console.log(Keypair.secretKey.toString());
// console.log(bs58.encode(Keypair.secretKey));

// const owner = loadKeypair("./payer.json");
// console.log(owner.publicKey.toBase58());

const jupApiUrl = "https://quote-api.jup.ag/v6";
const jupiterApi = createJupiterApiClient({ basePath: jupApiUrl})

const mainnetWallet = new PublicKey("GXL27Ww6mE73ggfyXfo3YVdjvu9R379yhiyh7fnK7ffS");
const inputMint = NATIVE_MINT;
const outputMint = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const amount = 0.01 * LAMPORTS_PER_SOL;

//1. get quote
const quote = await getQuoteFromJupiter({
    jupiterApi,
    inputMint: inputMint.toBase58(), 
    outputMint: outputMint.toBase58(), 
    amount,
});
//2. get swap transaction through quote result
const swapTransaction = await getSwapTransactionFromJupiter(
    jupiterApi,
    mainnetWallet,
    quote,
);
//3. simulate transaction
await rpcSimulateTransaction(connection, swapTransaction);



}

// await main().catch(console.error);
(async () => {
    try {
      await main();
    } catch (error) {
      console.error(error);
    }
  })();