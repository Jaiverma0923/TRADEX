"use client"
import { useState } from "react"
import { Button } from "@/src/components/ui/button"

const INDICES = [
  { label: "S&P 500", value: "5,832.10", change: "+0.82%", up: true },
  { label: "NASDAQ", value: "18,421.30", change: "+1.10%", up: true },
  { label: "DOW", value: "42,110.55", change: "-0.14%", up: false },
  { label: "VIX", value: "14.22", change: "-2.30%", up: false },
  { label: "10Y", value: "4.31%", change: "+0.02", up: true },
  { label: "Gold", value: "2,341.80", change: "+0.55%", up: true },
  { label: "Oil (WTI)", value: "78.42", change: "-0.90%", up: false },
]

const TIME_TABS = ["1D", "1W", "1M", "3M", "1Y", "All"]

const WATCHLIST = [
  { symbol: "AAPL", name: "Apple Inc.", price: 189.42, change: 1.24, avatar: { bg: "bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-300" } },
  { symbol: "NVDA", name: "NVIDIA Corp.", price: 875.60, change: 3.41, avatar: { bg: "bg-red-500/10", text: "text-red-700 dark:text-red-300" } },
  { symbol: "MSFT", name: "Microsoft", price: 412.18, change: -0.52, avatar: { bg: "bg-blue-500/10", text: "text-blue-700 dark:text-blue-300" } },
  { symbol: "AMZN", name: "Amazon", price: 182.05, change: 0.87, avatar: { bg: "bg-amber-500/10", text: "text-amber-700 dark:text-amber-300" } },
  { symbol: "GOOGL", name: "Alphabet", price: 163.90, change: -1.10, avatar: { bg: "bg-pink-500/10", text: "text-pink-700 dark:text-pink-300" } },
]

const HEATMAP = [
  { symbol: "NVDA", change: 3.41 },
  { symbol: "TSLA", change: 2.90 },
  { symbol: "AMD", change: 1.88 },
  { symbol: "AAPL", change: 1.24 },
  { symbol: "INTC", change: -2.15 },
  { symbol: "META", change: -1.32 },
  { symbol: "GOOGL", change: -1.10 },
  { symbol: "MSFT", change: -0.52 },
]

const NEWS = [
  { source: "Reuters", title: "Fed signals rate hold as inflation data cools further", time: "12 min ago" },
  { source: "Bloomberg", title: "NVIDIA surges on record data center revenue beat", time: "1 hr ago" },
  { source: "WSJ", title: "Apple eyes AI chip partnership with TSMC for 2026", time: "2 hr ago" },
  { source: "CNBC", title: "Tech sector leads broad market rally heading into close", time: "3 hr ago" },
]

const CHART_POINTS = [100, 95, 105, 88, 80, 92, 70, 60, 75, 55, 45, 58, 40, 30, 28]

function MiniSparkline({ up }: { up: boolean }) {
  const bars = up ? [40, 55, 70, 85, 100] : [100, 80, 65, 50, 35]
  return (
    <div className="flex items-end gap-[2px] h-6">
      {bars.map((h, i) => (
        <div
          key={i}
          className="w-[3px] rounded-sm"
          style={{ height: `${h}%`, background: up ? "#1D9E75" : "#D85A30" }}
        />
      ))}
    </div>
  )
}

function ChangeBadge({ change }: { change: number }) {
  const up = change >= 0
  return (
    <span
      className="inline-flex items-center gap-0.5 text-[11px] font-medium px-1.5 py-0.5 rounded"
      style={{ background: up ? "#E1F5EE" : "#FAECE7", color: up ? "#085041" : "#712B13" }}
    >
      {up ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
    </span>
  )
}

function PortfolioChart() {
  const w = 540
  const h = 130
  const min = Math.min(...CHART_POINTS)
  const max = Math.max(...CHART_POINTS)
  const pts = CHART_POINTS.map((v, i) => {
    const x = (i / (CHART_POINTS.length - 1)) * w
    const y = h - ((v - min) / (max - min)) * (h - 16) - 8
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(" ")
  const lastY = parseFloat(pts.split(" ").at(-1)!.split(",")[1])

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full" style={{ height: 130 }}>
      <polyline points={pts} fill="none" stroke="#1D9E75" strokeWidth="2" strokeLinejoin="round" />
      <polygon
        points={`0,${h} ${pts} ${w},${h}`}
        fill="#1D9E75"
        fillOpacity="0.08"
      />
      <line x1="0" y1={lastY} x2={w} y2={lastY} stroke="#1D9E75" strokeWidth="0.5" strokeDasharray="4,4" opacity="0.4" />
      <circle cx={w} cy={lastY} r="4" fill="#1D9E75" />
      <text x="4" y="12" fontSize="10" fill="#1D9E75" opacity="0.8">$84,230</text>
      <text x="4" y={h - 4} fontSize="10" fill="gray">$83,026</text>
    </svg>
  )
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("1D")

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-5">

      {/* Ticker strip */}
      <div className="flex items-center gap-6 pb-3 border-b border-border/40 overflow-x-auto scrollbar-none">
        {INDICES.map(({ label, value, change, up }) => (
          <div key={label} className="flex flex-col gap-0.5 flex-shrink-0">
            <span className="text-[10px] text-muted-foreground">{label}</span>
            <span className="text-[13px] font-medium tabular-nums">{value}</span>
            <span className={`text-[10px] font-medium ${up ? "text-emerald-500" : "text-red-400"}`}>{change}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-1.5 flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          <span className="text-[11px] text-muted-foreground">NYSE open</span>
        </div>
      </div>

      <div className="grid grid-cols-[1.6fr_1fr] gap-4">

        {/* Left column */}
        <div className="flex flex-col gap-4">

          {/* Portfolio card */}
          <div className="rounded-2xl border border-border/40 bg-card/60 p-5">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Portfolio value</p>
            <p className="text-[32px] font-medium tabular-nums leading-none mb-1">$84,230.48</p>
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground mb-4">
              <span className="text-emerald-500">▲ $1,204.32 (1.45%)</span>
              <span className="text-border">|</span>
              <span>Today</span>
            </div>

            {/* Time tabs */}
            <div className="flex gap-1 mb-4">
              {TIME_TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`text-[11px] px-2.5 py-1 rounded-md transition-colors ${
                    activeTab === t
                      ? "bg-muted text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Chart */}
            <div className="mb-4">
              <PortfolioChart />
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Day's gain", value: "+$1,204", up: true },
                { label: "Total return", value: "+8.8%", up: true },
                { label: "Open P&L", value: "+$6,810", up: true },
              ].map(({ label, value, up }) => (
                <div key={label} className="bg-muted/40 rounded-lg p-3">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">{label}</p>
                  <p className={`text-[16px] font-medium ${up ? "text-emerald-500" : "text-red-400"}`}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Heatmap */}
          <div className="rounded-2xl border border-border/40 bg-card/60 p-5">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Market heatmap</p>
            <div className="grid grid-cols-4 gap-1.5">
              {HEATMAP.map(({ symbol, change }) => {
                const up = change >= 0
                return (
                  <div
                    key={symbol}
                    className="rounded-lg p-2.5 flex flex-col gap-0.5"
                    style={{ background: up ? "#E1F5EE" : "#FAECE7" }}
                  >
                    <span className="text-[11px] font-medium" style={{ color: up ? "#085041" : "#712B13" }}>{symbol}</span>
                    <span className="text-[10px]" style={{ color: up ? "#1D9E75" : "#D85A30" }}>
                      {up ? "+" : ""}{change.toFixed(2)}%
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">

          {/* Watchlist */}
          <div className="rounded-2xl border border-border/40 bg-card/60 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Watchlist</p>
              <span className="text-[11px] text-muted-foreground">12 stocks</span>
            </div>

            <div className="space-y-0">
              {WATCHLIST.map((stock) => (
                <div key={stock.symbol} className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-medium ${stock.avatar.bg} ${stock.avatar.text}`}>
                      {stock.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-[13px] font-medium leading-none mb-0.5">{stock.symbol}</p>
                      <p className="text-[11px] text-muted-foreground">{stock.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MiniSparkline up={stock.change >= 0} />
                    <div className="text-right">
                      <p className="text-[13px] font-medium tabular-nums leading-none mb-1">${stock.price.toFixed(2)}</p>
                      <ChangeBadge change={stock.change} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full mt-3 text-xs h-8 rounded-lg text-muted-foreground">
              View all 12 stocks
            </Button>
          </div>

          {/* News */}
          <div className="rounded-2xl border border-border/40 bg-card/60 p-5">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">Market news</p>
            <div className="space-y-0">
              {NEWS.map((item, i) => (
                <div key={i} className="py-2.5 border-b border-border/30 last:border-0">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">{item.source}</p>
                  <p className="text-[12px] text-foreground leading-snug">{item.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{item.time}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}