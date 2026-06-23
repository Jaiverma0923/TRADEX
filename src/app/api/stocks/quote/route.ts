import { finnhubFetch } from "@/src/lib/finnhub";
import { errorResponse } from "@/src/lib/response";


export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const symbol = searchParams.get("symbol");
        if (!symbol?.trim()) {
            return errorResponse("Symbol is required", 400);
        }
        const data = await finnhubFetch(`/quote?symbol=${encodeURIComponent(symbol)}`)
        if (!data || typeof data.c !== "number") {
            return errorResponse("Invalid quote data",500);
        }
        return Response.json(
            {
                success: true,
                data: {
                    currentPrice: data.c,
                },
            },
            {
                status: 200
            }
        );


    } catch (error) {
        console.log(error)
        return errorResponse("Failed to fetch quote");
    }
}