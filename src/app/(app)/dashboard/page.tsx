"use client"
import { useSearch } from '@/src/context/searchContext'
import { ApiResponse } from '@/src/types/apiResponse'
import axios, { AxiosError } from 'axios'
import { Star, TrendingUp, Wallet, BarChart2, Layers, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/src/components/ui/button'

type Stock = {
  symbol: string
  companyName: string
}

type Dashboard = {
  totalInvested: number
  currentValue: number
  totalPnL: number
  totalPnLPercent: number
  holdingsCount: number
  transactionsCount: number
  largestHolding: string | null
}

const TICKER_INDICES = [
  { label: "S&P 500", value: "5,832", change: "+0.82%", up: true },
  { label: "NASDAQ", value: "18,421", change: "+1.10%", up: true },
  { label: "DOW", value: "42,110", change: "-0.14%", up: false },
  { label: "VIX", value: "14.22", change: "-2.30%", up: false },
]

function TickerStrip() {
  return (
    <div className="flex items-center overflow-hidden rounded-xl border border-border/40 mb-5 bg-card/60">
      {TICKER_INDICES.map(({ label, value, change, up }) => (
        <div key={label} className="flex flex-col gap-0.5 px-4 py-2.5 flex-1 border-r border-border/40 last:border-r-0">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
          <span className="text-[13px] font-medium tabular-nums">{value}</span>
          <span className={`text-[11px] font-medium ${up ? "text-emerald-500" : "text-red-400"}`}>{change}</span>
        </div>
      ))}
      <div className="flex items-center gap-1.5 px-4 py-2.5 flex-shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">NYSE open</span>
      </div>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  highlight,
}: {
  icon: React.ElementType
  label: string
  value: string
  sub?: string
  highlight?: "green" | "red"
}) {
  return (
    <div className="rounded-xl border border-border/40 bg-card/60 p-4 flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <div className="w-7 h-7 rounded-lg bg-muted/60 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
      </div>
      <p className={`text-xl font-medium tabular-nums ${highlight === "green" ? "text-emerald-500" :
          highlight === "red" ? "text-red-400" : ""
        }`}>{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  )
}

function DashboardView({ data }: { data: Dashboard | null }) {
  const fmt = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const pnlUp = (data?.totalPnL ?? 0) >= 0

  return (
    <div className="space-y-3">
      {/* Row 1: Portfolio value + P&L */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <MetricCard
          icon={Wallet}
          label="Total Invested"
          value={data ? `$${fmt(data.totalInvested)}` : "—"}
          sub="cost basis"
        />
        <MetricCard
          icon={BarChart2}
          label="Current Value"
          value={data ? `$${fmt(data.currentValue)}` : "—"}
          sub="at live prices"
        />
        <MetricCard
          icon={pnlUp ? ArrowUpRight : ArrowDownRight}
          label="Total P&L"
          value={
            data
              ? `${pnlUp ? "+" : "-"}$${fmt(Math.abs(data.totalPnL))}`
              : "—"
          }
          sub={data ? `${pnlUp ? "+" : ""}${data.totalPnLPercent.toFixed(2)}% all time` : undefined}
          highlight={data ? (pnlUp ? "green" : "red") : undefined}
        />
        <MetricCard
          icon={TrendingUp}
          label="Largest Position"
          value={data?.largestHolding ?? "—"}
          sub="by cost basis"
        />
      </div>

      {/* Row 2: Holdings + Transactions count */}
      <div className="grid grid-cols-2 gap-2.5">
        <MetricCard
          icon={Layers}
          label="Active Holdings"
          value={data ? String(data.holdingsCount) : "—"}
          sub="open positions"
        />
        <MetricCard
          icon={BarChart2}
          label="Transactions"
          value={data ? String(data.transactionsCount) : "—"}
          sub="total recorded"
        />
      </div>

      {/* Empty state */}
      {data && data.holdingsCount === 0 && (
        <div className="border border-dashed border-border/40 rounded-2xl p-10 text-center">
          <div className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center mx-auto mb-3">
            <BarChart2 className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium mb-1">No holdings yet</p>
          <p className="text-xs text-muted-foreground">
            Search for a stock above and add it to your watchlist, or record a transaction to get started.
          </p>
        </div>
      )}

      {/* Hint banner */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-border/40 bg-card/20">
        <Activity className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Use the search bar above to find stocks and add them to your watchlist. Head to{" "}
          <span className="text-foreground font-medium">Portfolio</span> to see a full breakdown with live prices and P&L.
        </p>
      </div>
    </div>
  )
}

export default function Page() {
  const { query } = useSearch()
  const [results, setResults] = useState<Stock[]>([])
  const [watchlist, setWatchlist] = useState<string[]>([])
  const [loadingSymbol, setLoadingSymbol] = useState<string | null>(null)
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [dashLoading, setDashLoading] = useState(true)
  const abortRef = useRef<AbortController | null>(null)

  const fetchWatchlist = async () => {
    try {
      const res = await axios.get("/api/watchlist")
      setWatchlist(res.data.data.map((s: { symbol: string }) => s.symbol))
    } catch (err) { console.error(err) }
  }

  const fetchDashboard = async () => {
    try {
      setDashLoading(true)
      const res = await axios.get("/api/dashboard")
      setDashboard(res.data.data)
    } catch (err) { console.error(err) }
    finally { setDashLoading(false) }
  }

  useEffect(() => { fetchWatchlist(); fetchDashboard() }, [])

  useEffect(() => {
    abortRef.current?.abort()
    if (!query.trim()) { setResults([]); return }
    abortRef.current = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const res = await axios.get(`/api/stocks/search?q=${query.trim()}`, {
          signal: abortRef.current!.signal,
        })
        setResults(res.data)
      } catch (err) {
        if (!axios.isCancel(err)) setResults([])
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const handleClick = async (stock: Stock) => {
    setLoadingSymbol(stock.symbol)
    try {
      const res = await axios.post('/api/watchlist', {
        symbol: stock.symbol,
        companyName: stock.companyName,
      })
      toast.success(res.data.action)
      await fetchWatchlist()
    } catch (err) {
      const axiosError = err as AxiosError<ApiResponse>
      toast.error("Something went wrong", { description: axiosError.response?.data.message })
    } finally { setLoadingSymbol(null) }
  }

  const hasQuery = query.trim().length > 0

  return (
    <div className="max-w-5xl mx-auto p-6">
      <TickerStrip />

      {!hasQuery && (
        dashLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-muted/40 rounded-xl p-4 h-24" />
            ))}
          </div>
        ) : (
          <DashboardView data={dashboard} />
        )
      )}

      {hasQuery && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-medium">
            Results for <span className="text-muted-foreground">`&quot;`{query.trim()}`&quot;`</span>
          </h2>
          {results.length > 0 && (
            <span className="text-xs text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full">
              {results.length} found
            </span>
          )}
        </div>
      )}

      {hasQuery && results.length > 0 && (
        <div className="space-y-2">
          {results.map((stock) => {
            const isSaved = watchlist.includes(stock.symbol)
            return (
              <div key={`${stock.symbol}-${stock.companyName}`}
                className="flex items-center justify-between px-4 py-3 rounded-xl border border-border/40 bg-card/60 hover:border-emerald-600/30 hover:bg-card/80 transition-all duration-150">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[11px] font-medium flex-shrink-0"
                    style={{ background: "#E1F5EE", color: "#085041" }}>
                    {stock.symbol.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[14px] font-medium leading-none mb-0.5">{stock.symbol}</p>
                    <p className="text-xs text-muted-foreground">{stock.companyName}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleClick(stock)}
                  disabled={loadingSymbol === stock.symbol}
                >
                  <Star className={`h-5 w-5 ${loadingSymbol === stock.symbol ? "animate-pulse text-muted-foreground"
                      : isSaved ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`} />
                </Button>
              </div>
            )
          })}
        </div>
      )}

      {hasQuery && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border/40 rounded-2xl">
          <svg className="w-7 h-7 text-muted-foreground/30 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <p className="text-[14px] font-medium">No stocks found</p>
          <p className="text-xs text-muted-foreground mt-1">Try a different ticker or company name</p>
        </div>
      )}
    </div>
  )
}