import { DefaultApi, QuoteGetRequest, QuoteGetSwapModeEnum } from "@jup-ag/api";

export async function getQuote( 
    jupiterApi: DefaultApi, 
    inputMint: string, 
    outputMint: string, 
    amount: number,
    swapMode: QuoteGetSwapModeEnum = "ExactIn" || "ExactOut",
) {
    
    const quoteRequest: QuoteGetRequest = {
        inputMint,
        outputMint,
        amount,
        autoSlippage: true,
        swapMode,
    };

    const quote = await jupiterApi.quoteGet(quoteRequest);
    console.log(`outputamount: ${quote.outAmount}`);
    return quote;

}