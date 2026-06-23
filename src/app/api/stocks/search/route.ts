import { finnhubFetch } from "@/src/lib/finnhub";
import { errorResponse } from "@/src/lib/response";

type FinnhubStock = {
  symbol: string;
  description: string;
}
export async function GET(req:Request){
    try {
        const {searchParams} =new URL(req.url);
        const query = searchParams.get("q");
        if(!query?.trim()){
            return errorResponse("Query is required",400)
        }
        const data=await finnhubFetch(`/search?q=${encodeURIComponent(query)}`)
        const stocks=(data.result ?? [])
        .slice(0, 10)
        .map((stock: FinnhubStock)=>({
            symbol:stock.symbol,
            companyName: stock.description,
        }))
        return Response.json(stocks)
    } catch (error) {
        console.error("Error searching stock:", error);
        return errorResponse("Error searching stock")
    }
}