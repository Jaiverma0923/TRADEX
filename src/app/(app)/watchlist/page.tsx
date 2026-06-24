"use client"
import { Button } from "@/src/components/ui/button"
import { Spinner } from "@/src/components/ui/spinner"
import { ApiResponse } from "@/src/types/apiResponse"
import axios, { AxiosError } from "axios"
import { Star } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

type Stock = {
  symbol: string
  companyName: string
}

function Page() {
  const [loading, setLoading] = useState(true)
  const [stocks, setStocks] = useState<Stock[]>([])
  const [loadingSymbol, setLoadingSymbol] = useState<string | null>(null)

  const fetchWatchlist = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/api/watchlist")
      setStocks(response.data.data)
    } finally {
      setLoading(false)
    }
  }

  const handleClick = async (data: Stock) => {
    setLoadingSymbol(data.symbol)
    const previousStocks = stocks
    setStocks((prev) => prev.filter((s) => s.symbol !== data.symbol))
    try {
      const response = await axios.post("/api/watchlist", {
        symbol: data.symbol,
        companyName: data.companyName,
      })
      toast.success(response.data.action)
    } catch (error) {
      setStocks(previousStocks)
      const axiosError = error as AxiosError<ApiResponse>
      toast.error("Something went wrong", { description: axiosError.response?.data.message })
    } finally {
      setLoadingSymbol(null)
    }
  }

  useEffect(() => { fetchWatchlist() }, [])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-3 md:p-6">
        <h1 className="text-xl md:text-2xl font-bold mb-6">Watchlist</h1>
        <div className="flex items-center justify-center h-[60vh]">
          <Spinner className="h-8 w-8 animate-spin text-cyan-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-3 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Watchlist</h1>
        <span className="text-sm text-muted-foreground">{stocks.length} stocks</span>
      </div>

      {stocks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <h3 className="text-lg font-semibold">No stocks in watchlist</h3>
          <p className="text-sm text-muted-foreground mt-1">Search and add stocks from the dashboard</p>
        </div>
      ) : (
        <div className="space-y-2 md:space-y-3">
          {stocks.map((stock) => (
            <div
              key={`${stock.symbol}-${stock.companyName}`}
              className="group flex items-center justify-between p-3 md:p-5 rounded-2xl border bg-card/50 backdrop-blur-sm hover:bg-card hover:border-cyan-500/30 transition-all duration-200"
            >
              <div className="flex items-center gap-3 md:gap-4 min-w-0">
                <div className="h-9 w-9 md:h-12 md:w-12 rounded-xl bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-sm md:text-base text-cyan-400">
                    {stock.symbol.slice(0, 2)}
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-base md:text-lg tracking-tight leading-none mb-0.5">
                    {stock.symbol}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground truncate max-w-[180px] md:max-w-none">
                    {stock.companyName}
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleClick(stock)}
                className="hover:scale-110 transition-transform flex-shrink-0"
                disabled={loadingSymbol === stock.symbol}
              >
                <Star className={`h-5 w-5 md:h-6 md:w-6 ${
                  loadingSymbol === stock.symbol ? "animate-pulse" : "fill-yellow-400 text-yellow-400"
                }`} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Page