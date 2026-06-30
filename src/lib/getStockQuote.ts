import { finnhubFetch } from "./finnhub";

export async function getStockQuote(symbol: string) {
    try {
        const quote = await finnhubFetch(
            `/quote?symbol=${symbol.toUpperCase()}`
        );

        return {
            currentPrice: quote.c,
            change: quote.d,
            percentChange: quote.dp,
            high: quote.h,
            low: quote.l,
            open: quote.o,
            previousClose: quote.pc,
        };
    } catch {
        return {
            currentPrice: null,
            change: null,
            percentChange: null,
            high: null,
            low: null,
            open: null,
            previousClose: null,
        };
    }
}