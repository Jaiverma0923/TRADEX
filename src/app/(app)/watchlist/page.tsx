"use client"
import { Button } from "@/src/components/ui/button"
import { Spinner } from "@/src/components/ui/spinner"
import { StockQuote } from "@/src/lib/price/types"
import { ApiResponse } from "@/src/types/apiResponse"
import axios, { AxiosError } from "axios"
import { Star } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

type Stock = {
  symbol: string;
  companyName: string;
}& StockQuote;

const COLORS = [
  { bg: "bg-blue-500/10",    text: "text-blue-800 dark:text-blue-300" },
  { bg: "bg-emerald-500/10", text: "text-emerald-800 dark:text-emerald-300" },
  { bg: "bg-amber-500/10",   text: "text-amber-800 dark:text-amber-300" },
  { bg: "bg-pink-500/10",    text: "text-pink-800 dark:text-pink-300" },
  { bg: "bg-violet-500/10",  text: "text-violet-800 dark:text-violet-300" },
]

function getColor(symbol: string) {
  return COLORS[symbol.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % COLORS.length]
}

function fmt(n: number | null, digits = 2) {
  return n == null ? "—" : n.toFixed(digits)
}

function SkeletonRow() {
  return (
    <div className="animate-pulse flex items-center justify-between p-3 md:p-5 rounded-2xl border bg-card/50">
      <div className="flex items-center gap-3 md:gap-4">
        <div className="h-9 w-9 md:h-12 md:w-12 rounded-xl bg-muted flex-shrink-0" />
        <div className="space-y-1.5">
          <div className="h-3.5 w-14 bg-muted rounded" />
          <div className="h-2.5 w-28 bg-muted rounded" />
          <div className="h-2.5 w-20 bg-muted rounded" />
        </div>
      </div>
      <div className="space-y-1.5 text-right">
        <div className="h-3.5 w-16 bg-muted rounded ml-auto" />
        <div className="h-2.5 w-20 bg-muted rounded ml-auto" />
      </div>
    </div>
  )
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

  return (
    <div className="max-w-5xl mx-auto p-3 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-medium">Watchlist</h1>
        {!loading && (
          <span className="text-xs text-muted-foreground bg-muted/50 border border-border/40 px-3 py-1 rounded-full">
            {stocks.length} stocks
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-2 md:space-y-3">
          {[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : stocks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <h3 className="text-lg font-medium">No stocks in watchlist</h3>
          <p className="text-sm text-muted-foreground mt-1">Search and add stocks from the dashboard</p>
        </div>
      ) : (
        <div className="space-y-2 md:space-y-3">
          {stocks.map((stock) => {
            const c = getColor(stock.symbol)
            const hasData = stock.currentPrice != null
            const isUp = (stock.change ?? 0) >= 0
            const pnlColor = isUp ? "text-emerald-500" : "text-red-400"

            return (
              <div
                key={`${stock.symbol}-${stock.companyName}`}
                className="group flex items-center justify-between p-3 md:p-5 rounded-2xl border bg-card/50 backdrop-blur-sm hover:bg-card hover:border-border/60 transition-all duration-200"
              >
                <div className="flex items-center gap-3 md:gap-4 min-w-0">
                  <div className={`h-9 w-9 md:h-12 md:w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${c.bg}`}>
                    <span className={`font-medium text-sm md:text-base ${c.text}`}>
                      {stock.symbol.slice(0, 2)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-base md:text-lg tracking-tight leading-none mb-1">
                      {stock.symbol}
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground truncate max-w-[180px] md:max-w-none">
                      {stock.companyName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-sm md:text-base font-medium tabular-nums">
                      {hasData ? `$${fmt(stock.currentPrice)}` : "—"}
                    </p>
                    <p className={`text-xs md:text-sm tabular-nums ${hasData ? pnlColor : "text-muted-foreground"}`}>
                      {hasData
                        ? `${isUp ? "+" : ""}${fmt(stock.change)} (${isUp ? "+" : ""}${fmt(stock.percentChange)}%)`
                        : "—"}
                    </p>
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
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Page