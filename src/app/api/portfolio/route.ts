import dbConnect from "@/src/lib/dbConnect";
import TransactionModel from "@/src/model/transaction";
import { auth } from "../auth/[...nextauth]/option";
import { errorResponse } from "@/src/lib/response";
import { finnhubFetch } from "@/src/lib/finnhub";

type PortfolioStock = {
    symbol: string;
    companyName: string;
    shares: number;
    costBasis: number;
};

export async function GET() {
    await dbConnect();

    try {
        const session = await auth();

        if (!session) {
            return errorResponse("Unauthorized", 401);
        }
        const transactions = await TransactionModel.find({ userId: session.user._id, }).lean();

        const portfolio: Record<string, PortfolioStock> = {};
        for (const tx of transactions) {
            if (!portfolio[tx.symbol]) {
                portfolio[tx.symbol] = {
                    symbol: tx.symbol,
                    companyName: tx.companyName,
                    shares: 0,
                    costBasis: 0,
                };
            }
            const stock = portfolio[tx.symbol];
            if (tx.type === "BUY") {
                stock.shares += tx.quantity;
                stock.costBasis += tx.quantity * tx.price;
            }
            else if (tx.type === "SELL") {
                if (stock.shares < tx.quantity) {
                    continue
                }
                else {
                    const avgCost = stock.costBasis / stock.shares;
                    stock.shares -= tx.quantity;
                    stock.costBasis -= avgCost * tx.quantity;
                }
            }
        }
        const holdings = Object.values(portfolio)
            .filter(stock => stock.shares > 0)
            .map(stock => ({
                symbol: stock.symbol,
                companyName: stock.companyName,
                shares: stock.shares,
                costBasis: Number(
                    stock.costBasis.toFixed(2)
                ),
                avgCost: Number(
                    (
                        stock.costBasis /
                        stock.shares
                    ).toFixed(2)
                ),
            }));
            //promise.all allow us to run request in parallel execution instead of sequential execution
        const enrichedHoldings = await Promise.all(
            holdings.map(async (stock) => {
                try {
                    const quote = await finnhubFetch(`/quote?symbol=${stock.symbol.toUpperCase()}`);
                    const currentPrice = quote.c;
                    const currentValue = stock.shares * currentPrice;
                    const unrealizedPnL = currentValue - stock.costBasis;
                    const unrealizedPnLPercent = stock.costBasis > 0 ? (unrealizedPnL / stock.costBasis) * 100 : 0;

                    return {
                        ...stock,
                        currentPrice,
                        currentValue,
                        unrealizedPnL,
                        unrealizedPnLPercent,
                    };
                } catch {
                    return {
                        ...stock,
                        currentPrice: null,
                        currentValue: null,
                        unrealizedPnL: null,
                        unrealizedPnLPercent: null,
                    };
                }
            })
        );
        
        return Response.json(
            {
                success: true,
                data: enrichedHoldings
            },
            {
                status: 200
            }
        )



    } catch (error) {
        console.error(error);
        return errorResponse("Error fetching portfolio");
    }
}