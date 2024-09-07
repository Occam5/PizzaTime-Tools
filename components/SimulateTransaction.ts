import { Connection, PublicKey, VersionedTransaction } from "@solana/web3.js";

export async function rpcSimulateTransaction(
    connection: Connection,
    testTransaction: VersionedTransaction,
) {
    const rpcResponse = await connection.simulateTransaction(testTransaction, {
        replaceRecentBlockhash: true,
        commitment: "confirmed",
        sigVerify: false,
    });

    console.log(`rpcResponse: ${JSON.stringify(rpcResponse,null, 2)}`);
    return rpcResponse.value.unitsConsumed || null;
}   