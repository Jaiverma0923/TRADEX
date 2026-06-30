import dbConnect from "@/src/lib/dbConnect";
import TransactionModel from "@/src/model/transaction";
import { auth } from "../auth/[...nextauth]/option";
import { errorResponse } from "@/src/lib/response";
import { finnhubFetch } from "@/src/lib/finnhub";
import { getStockQuote } from "@/src/lib/getStockQuote";

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
                const quote = await getStockQuote(stock.symbol);

                const currentPrice = quote.currentPrice;

                const currentValue =
                    currentPrice !== null
                        ? stock.shares * currentPrice
                        : null;

                const unrealizedPnL =
                    currentValue !== null
                        ? currentValue - stock.costBasis
                        : null;

                const unrealizedPnLPercent =
                    unrealizedPnL !== null && stock.costBasis > 0
                        ? (unrealizedPnL / stock.costBasis) * 100
                        : null;

                return {
                    ...stock,
                    ...quote,
                    currentValue,
                    unrealizedPnL,
                    unrealizedPnLPercent,
                };
            })
        );
        const totalInvested = enrichedHoldings.reduce(
            (sum, stock) => sum + stock.costBasis,
            0
        );

        const totalCurrentValue = enrichedHoldings.reduce(
            (sum, stock) => sum + (stock.currentValue || 0),
            0
        );

        const totalPnL = totalCurrentValue - totalInvested;

        const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

        const validHoldings = enrichedHoldings.filter(
            (
                stock
            ): stock is typeof stock & { unrealizedPnLPercent: number } =>
                stock.unrealizedPnLPercent !== null
        );

        const bestPerformer =
            validHoldings.length > 0
                ? validHoldings.reduce((best, current) =>
                    current.unrealizedPnLPercent >
                        best.unrealizedPnLPercent
                        ? current
                        : best
                )
                : null;

        const worstPerformer =
            validHoldings.length > 0
                ? validHoldings.reduce((worst, current) =>
                    current.unrealizedPnLPercent <
                        worst.unrealizedPnLPercent
                        ? current
                        : worst
                )
                : null;

        return Response.json(
            {
                success: true,
                data: enrichedHoldings,
                summary: {
                    totalInvested,
                    totalCurrentValue,
                    totalPnL,
                    totalPnLPercent,
                    bestPerformer,
                    worstPerformer,
                },
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