import dbConnect from "@/src/lib/dbConnect";
import { errorResponse } from "@/src/lib/response";
import { auth } from "../auth/[...nextauth]/option";
import TransactionModel from "@/src/model/transaction";

export async function GET() {
  await dbConnect();
  try {
    const session = await auth();
    if (!session) return errorResponse("unauthorized", 401);

    const user = session.user._id;
    const transactions = await TransactionModel.find({ userId: user }).lean();

    type PortfolioStock = {
      symbol: string;
      companyName: string;
      shares: number;
      costBasis: number;
    };

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
      } else if (tx.type === "SELL") {
        if (stock.shares < tx.quantity) continue;
        const avgCost = stock.costBasis / stock.shares;
        stock.shares -= tx.quantity;
        stock.costBasis -= avgCost * tx.quantity;
      }
    }

    const holdings = Object.values(portfolio)
      .filter((s) => s.shares > 0)
      .map((s) => ({
        symbol: s.symbol,
        companyName: s.companyName,
        shares: s.shares,
        costBasis: Number(s.costBasis.toFixed(2)),
        avgCost: Number((s.costBasis / s.shares).toFixed(2)),
      }));

    const totalInvested = holdings.reduce((sum, s) => sum + s.costBasis, 0);
    const holdingsCount = holdings.length;
    const transactionsCount = transactions.length;
    const largestHolding =
      holdings.length > 0
        ? holdings.reduce((max, s) => (s.costBasis > max.costBasis ? s : max)).symbol
        : null;

    // currentValue & P&L — replace 1 with real live price if you have it
    const currentValue = totalInvested; // swap with live price sum when ready
    const totalPnL = currentValue - totalInvested;
    const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

    return Response.json(
      {
        success: true,
        data: {
          totalInvested: Number(totalInvested.toFixed(2)),
          currentValue: Number(currentValue.toFixed(2)),
          totalPnL: Number(totalPnL.toFixed(2)),
          totalPnLPercent: Number(totalPnLPercent.toFixed(2)),
          holdingsCount,
          transactionsCount,
          largestHolding,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching dashboard", error);
    return errorResponse("Error fetching dashboard");
  }
}