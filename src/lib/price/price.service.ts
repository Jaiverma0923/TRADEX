import { finnhubFetch } from "../finnhub";
import { StockQuote } from "./types";

class PriceService {

    async getQuote(symbol: string): Promise<StockQuote> {

        const quote = await finnhubFetch(
            `/quote?symbol=${symbol.toUpperCase()}`
        );
        // console.log(quote);

        return {
            symbol,

            currentPrice: quote.c,
            change: quote.d,
            percentChange: quote.dp,

            high: quote.h,
            low: quote.l,
            open: quote.o,
            previousClose: quote.pc,
        };
    }

    async getQuotes(symbols: string[]) {

        const quotes = await Promise.all(
            symbols.map(symbol => this.getQuote(symbol))
        );

        return new Map(
            quotes.map(quote => [quote.symbol, quote])
        );

    }
}

export const priceService = new PriceService();