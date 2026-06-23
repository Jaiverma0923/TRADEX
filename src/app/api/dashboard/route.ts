import dbConnect from "@/src/lib/dbConnect";
import { errorResponse } from "@/src/lib/response";
import { auth } from "../auth/[...nextauth]/option";
import TransactionModel from "@/src/model/transaction";

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
            return errorResponse("unauthorized", 401);
        }
        const user = session?.user._id;
        const transactions = await TransactionModel.find({ userId: user, }).lean();
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
        const totalInvested = holdings.reduce((sum, stock) =>
            sum + stock.costBasis,
            0
        );
        const holdingsCount = holdings.length;
        const transactionsCount = transactions.length;
        const largestHolding = holdings.length > 0 ? holdings.reduce((max, stock) =>stock.costBasis > max.costBasis ? stock : max ) : null;
        return Response.json(
            {
                success: true,
                data: {
                    totalInvested,
                    holdingsCount,
                    transactionsCount,
                    largestHolding,
                },
            },
            {
                status:200
            }
        );


    } catch (error) {
        console.log("Error fetching dashboard", error);
        return errorResponse("Error fetching dashboard");
    }
}