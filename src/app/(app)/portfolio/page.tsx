"use client"

import axios from "axios"
import { useEffect, useState } from "react"

type Holding = {
  symbol: string
  companyName: string
  shares: number
  costBasis: number
  avgCost: number
  currentPrice: number | null
  currentValue: number | null
  unrealizedPnL: number | null
  unrealizedPnLPercent: number | null
}

type Performer = {
  symbol: string
  companyName: string
  unrealizedPnLPercent: number
}

type Summary = {
  totalInvested: number
  totalCurrentValue: number
  totalPnL: number
  totalPnLPercent: number
  bestPerformer: Performer | null
  worstPerformer: Performer | null
}

const AVATAR_COLORS = [
  { bg: "bg-emerald-500/10", text: "text-emerald-800 dark:text-emerald-300", bar: "#1D9E75" },
  { bg: "bg-blue-500/10",    text: "text-blue-800 dark:text-blue-300",       bar: "#378ADD" },
  { bg: "bg-amber-500/10",   text: "text-amber-800 dark:text-amber-300",     bar: "#EF9F27" },
  { bg: "bg-pink-500/10",    text: "text-pink-800 dark:text-pink-300",       bar: "#D4537E" },
  { bg: "bg-violet-500/10",  text: "text-violet-800 dark:text-violet-300",   bar: "#7F77DD" },
]

const getColor = (symbol: string) =>
  AVATAR_COLORS[symbol.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length]

const fmt = (n: number | null | undefined) =>
  n == null ? "—" : n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function SkeletonRow() {
  return (
    <tr className="border-b border-border/30 animate-pulse">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-muted flex-shrink-0" />
          <div className="space-y-1.5">
            <div className="h-3 w-12 bg-muted rounded" />
            <div className="h-2.5 w-24 bg-muted rounded" />
          </div>
        </div>
      </td>
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-4 py-3 text-right">
          <div className="h-3 w-16 bg-muted rounded ml-auto" />
        </td>
      ))}
    </tr>
  )
}

function SkeletonCard() {
  return (
    <div className="animate-pulse flex items-center justify-between px-4 py-3 rounded-xl border border-border/40">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-muted flex-shrink-0" />
        <div className="space-y-1.5">
          <div className="h-3 w-12 bg-muted rounded" />
          <div className="h-2.5 w-20 bg-muted rounded" />
        </div>
      </div>
      <div className="space-y-1.5 text-right">
        <div className="h-3 w-16 bg-muted rounded ml-auto" />
        <div className="h-2.5 w-12 bg-muted rounded ml-auto" />
      </div>
    </div>
  )
}

export default function Page() {
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get("/api/portfolio")
        setHoldings(response.data.data)
        setSummary(response.data.summary)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPortfolio()
  }, [])

  const totalInvested = summary?.totalInvested ?? holdings.reduce((s, h) => s + h.costBasis, 0)
  const totalValue    = summary?.totalCurrentValue ?? holdings.reduce((s, h) => s + (h.currentValue ?? 0), 0)
  const totalPnL      = summary?.totalPnL ?? 0
  const totalPnLPct   = summary?.totalPnLPercent ?? 0
  const isPnLUp       = totalPnL >= 0

  // ✅ Fix 2: largest by current value, not cost basis
  const largest = holdings.length > 0
    ? holdings.reduce((m, h) => (h.currentValue ?? 0) > (m.currentValue ?? 0) ? h : m)
    : null

  // ✅ Fix 1: largest weight by current value
  const largestWeight = largest && totalValue > 0
    ? (((largest.currentValue ?? 0) / totalValue) * 100).toFixed(0)
    : "0"

  const getWeight = (value: number | null) =>
  totalValue > 0
    ? (((value ?? 0) / totalValue) * 100).toFixed(0)
    : "0";

  const best  = summary?.bestPerformer
  const worst = summary?.worstPerformer

  return (
    <div className="max-w-5xl mx-auto p-3 md:p-6 space-y-3 md:space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-medium">Portfolio</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Your current holdings</p>
        </div>
        {!isLoading && (
          <span className="text-xs text-muted-foreground bg-muted/60 px-3 py-1 rounded-full">
            {holdings.length} holdings
          </span>
        )}
      </div>

      {/* ✅ Fix 3: 4 metric cards — replaced Largest Position with Portfolio Return */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        <div className="bg-muted/40 rounded-xl p-3 md:p-3.5">
          <p className="text-[9px] md:text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Current value</p>
          <p className="text-base md:text-lg font-medium tabular-nums">
            {isLoading ? "—" : `$${fmt(totalValue)}`}
          </p>
          <p className={`text-[10px] md:text-[11px] mt-1 ${isPnLUp ? "text-emerald-500" : "text-red-400"}`}>
            {isLoading ? "" : `${isPnLUp ? "↑" : "↓"} $${fmt(Math.abs(totalPnL))}`}
          </p>
        </div>

        <div className="bg-muted/40 rounded-xl p-3 md:p-3.5">
          <p className="text-[9px] md:text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Total invested</p>
          <p className="text-base md:text-lg font-medium tabular-nums">
            {isLoading ? "—" : `$${fmt(totalInvested)}`}
          </p>
          <p className="text-[10px] md:text-[11px] text-muted-foreground mt-1">cost basis</p>
        </div>

        <div className="bg-muted/40 rounded-xl p-3 md:p-3.5">
          <p className="text-[9px] md:text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Unrealized P&L</p>
          <p className={`text-base md:text-lg font-medium tabular-nums ${isPnLUp ? "text-emerald-500" : "text-red-400"}`}>
            {isLoading ? "—" : `${isPnLUp ? "+" : ""}$${fmt(totalPnL)}`}
          </p>
          <p className={`text-[10px] md:text-[11px] mt-1 ${isPnLUp ? "text-emerald-500" : "text-red-400"}`}>
            {isLoading ? "" : `${isPnLUp ? "+" : ""}${totalPnLPct.toFixed(2)}%`}
          </p>
        </div>

        {/* ✅ Fix 3: Portfolio Return replaces Largest Position here */}
        <div className="bg-muted/40 rounded-xl p-3 md:p-3.5">
          <p className="text-[9px] md:text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Portfolio return</p>
          <p className={`text-base md:text-lg font-medium tabular-nums ${isPnLUp ? "text-emerald-500" : "text-red-400"}`}>
            {isLoading ? "—" : `${isPnLUp ? "+" : ""}${totalPnLPct.toFixed(2)}%`}
          </p>
          <p className="text-[10px] md:text-[11px] text-muted-foreground mt-1">
            {isLoading ? "" : "since first buy"}
          </p>
        </div>
      </div>

      {/* Best / Worst + Largest Position row */}
      {!isLoading && (best || worst || largest) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
          {best && (
            <div className="bg-muted/40 rounded-xl p-3 md:p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[9px] md:text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Best performer</p>
                <p className="text-base font-medium leading-none mb-0.5">{best.symbol.toUpperCase()}</p>
                <p className="text-[11px] text-emerald-500">+{best.unrealizedPnLPercent.toFixed(2)}%</p>
              </div>
            </div>
          )}
          {worst && (
            <div className="bg-muted/40 rounded-xl p-3 md:p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                  <polyline points="17 18 23 18 23 12" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[9px] md:text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Worst performer</p>
                <p className="text-base font-medium leading-none mb-0.5">{worst.symbol.toUpperCase()}</p>
                <p className={`text-[11px] ${worst.unrealizedPnLPercent < 0 ? "text-red-400" : "text-emerald-500"}`}>
                  {worst.unrealizedPnLPercent >= 0 ? "+" : ""}{worst.unrealizedPnLPercent.toFixed(2)}%
                </p>
              </div>
            </div>
          )}
          {/* ✅ Fix 3: Largest Position moved here, smaller */}
          {largest && (
            <div className="bg-muted/40 rounded-xl p-3 md:p-3.5 flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-medium flex-shrink-0 ${getColor(largest.symbol).bg} ${getColor(largest.symbol).text}`}
              >
                {largest.symbol.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-[9px] md:text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Largest position</p>
                <p className="text-base font-medium leading-none mb-0.5">{largest.symbol.toUpperCase()}</p>
                <p className="text-[11px] text-muted-foreground">{largestWeight}% of portfolio</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ✅ Fix 1: Allocation bar uses current value */}
      {!isLoading && holdings.length > 0 && totalValue > 0 && (
        <div className="bg-muted/40 rounded-xl p-3 md:p-3.5">
          <p className="text-[9px] md:text-[10px] uppercase tracking-wider text-muted-foreground mb-3">Allocation</p>
          <div className="flex h-1.5 rounded-full overflow-hidden gap-[2px]">
            {holdings.map((h) => (
              <div
                key={h.symbol}
                style={{
                  width: `${(((h.currentValue ?? 0) / totalValue) * 100).toFixed(1)}%`,
                  background: getColor(h.symbol).bar,
                }}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
            {holdings.map((h) => {
              const w = (((h.currentValue ?? 0) / totalValue) * 100).toFixed(0)
              return (
                <div key={h.symbol} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: getColor(h.symbol).bar }} />
                  <span className="text-xs text-muted-foreground">{h.symbol.toUpperCase()}</span>
                  <span className="text-xs font-medium">{w}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Mobile: card list */}
      {(isLoading || holdings.length > 0) && (
        <>
          <div className="md:hidden space-y-2">
            {isLoading
              ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
              : holdings.map((h) => {
                const avatarColor = getColor(h.symbol)
                const pnlUp = h.unrealizedPnL != null && h.unrealizedPnL >= 0
                // ✅ Fix 1: weight by current value
                const weight = totalValue > 0 ? (((h.currentValue ?? 0) / totalValue) * 100).toFixed(0) : "0"
                return (
                  <div key={h.symbol} className="rounded-xl border border-border/40 bg-card/60 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-medium flex-shrink-0 ${avatarColor.bg} ${avatarColor.text}`}>
                          {h.symbol.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm leading-none mb-0.5">{h.symbol.toUpperCase()}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[140px]">{h.companyName}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-medium tabular-nums">
                          {h.currentValue == null ? "—" : `$${fmt(h.currentValue)}`}
                        </p>
                        <p className={`text-xs tabular-nums ${h.unrealizedPnL == null ? "text-muted-foreground" : pnlUp ? "text-emerald-500" : "text-red-400"}`}>
                          {h.unrealizedPnL == null ? "—" : `${pnlUp ? "+" : ""}$${fmt(h.unrealizedPnL)}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30 text-[11px] text-muted-foreground">
                      <span>{h.shares} shares · avg ${fmt(h.avgCost)}</span>
                      <span>{weight}% of portfolio</span>
                    </div>
                  </div>
                )
              })}
          </div>

          {/* Desktop: table */}
          <div className="hidden md:block rounded-2xl border border-border/40 overflow-hidden">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border/40">
                  {[
                    { label: "Stock", right: false },
                    { label: "Shares", right: true },
                    { label: "Avg cost", right: true },
                    { label: "Current price", right: true },
                    { label: "Current value", right: true },
                    { label: "Unrealized P&L", right: true },
                    { label: "Weight", right: true },
                  ].map(({ label, right }) => (
                    <th
                      key={label}
                      className={`text-[10px] uppercase tracking-wider font-medium text-muted-foreground px-4 py-3 whitespace-nowrap ${right ? "text-right" : "text-left"}`}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? [...Array(4)].map((_, i) => <SkeletonRow key={i} />)
                  : holdings.map((h) => {
                    // ✅ Fix 1: weight by current value
                    const weight = totalValue > 0 ? (((h.currentValue ?? 0) / totalValue) * 100).toFixed(0) : "0"
                    const avatarColor = getColor(h.symbol)
                    const pnlUp = h.unrealizedPnL != null && h.unrealizedPnL >= 0
                    return (
                      <tr key={h.symbol} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-medium flex-shrink-0 ${avatarColor.bg} ${avatarColor.text}`}>
                              {h.symbol.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium leading-none mb-0.5">{h.symbol.toUpperCase()}</p>
                              <p className="text-[11px] text-muted-foreground truncate max-w-[120px]">{h.companyName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{h.shares}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">${fmt(h.avgCost)}</td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {h.currentPrice == null ? "—" : `$${fmt(h.currentPrice)}`}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums font-medium">
                          {h.currentValue == null ? "—" : `$${fmt(h.currentValue)}`}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <p className={`tabular-nums font-medium ${pnlUp ? "text-emerald-500" : "text-red-400"}`}>
                            {h.unrealizedPnL == null ? "—" : `${pnlUp ? "+" : ""}$${fmt(h.unrealizedPnL)}`}
                          </p>
                          <p className={`text-[11px] mt-0.5 ${pnlUp ? "text-emerald-500" : "text-red-400"}`}>
                            {h.unrealizedPnLPercent == null ? "—" : `${pnlUp ? "+" : ""}${h.unrealizedPnLPercent.toFixed(2)}%`}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-xs text-muted-foreground">{weight}%</span>
                          <div className="w-12 h-1 bg-border/40 rounded-full mt-1.5 ml-auto">
                            <div className="h-full rounded-full" style={{ width: `${weight}%`, background: avatarColor.bar }} />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!isLoading && holdings.length === 0 && (
        <div className="border border-dashed border-border/40 rounded-2xl p-12 text-center">
          <p className="text-sm text-muted-foreground">No holdings yet</p>
          <p className="text-xs text-muted-foreground mt-1">Add transactions to see your portfolio</p>
        </div>
      )}
    </div>
  )
}