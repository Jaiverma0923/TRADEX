import { cn } from "@/lib/utils"

const TICKERS = [
  { sym: "AAPL",     price: "213.40", chg: "+1.2%", up: true  },
  { sym: "TSLA",     price: "178.55", chg: "-0.8%", up: false },
  { sym: "NVDA",     price: "891.20", chg: "+3.4%", up: true  },
  { sym: "MSFT",     price: "420.10", chg: "+0.5%", up: true  },
  { sym: "AMZN",     price: "182.90", chg: "-0.3%", up: false },
  { sym: "META",     price: "505.60", chg: "+2.1%", up: true  },
  { sym: "GOOGL",    price: "174.30", chg: "+0.9%", up: true  },
  { sym: "NIFTY",    price: "22,419", chg: "-0.4%", up: false },
  { sym: "BTC",      price: "67,120", chg: "+1.8%", up: true  },
  { sym: "ETH",      price: "3,480",  chg: "+2.6%", up: true  },
  { sym: "RELIANCE", price: "2,941",  chg: "+0.7%", up: true  },
  { sym: "TCS",      price: "3,780",  chg: "-1.1%", up: false },
]

export function TickerPanel() {
  const doubled = [...TICKERS, ...TICKERS]
  return (
    <aside className="hidden md:flex w-56 h-full flex-shrink-0 flex-col bg-[#0A0F1E] px-5 py-7 overflow-hidden">
      <div className="font-['Space_Grotesk',sans-serif] font-bold text-[22px] tracking-tight text-[#F0F4FF] mb-1">
        Trade<span className="text-[#00D4FF]">X</span>
      </div>
      <p className="text-[11px] text-[#4A5578] mb-7 tracking-wide">Markets never sleep</p>
      <p className="text-[10px] uppercase tracking-widest text-[#4A5578] mb-2.5">Live markets</p>

      <div className="h-[500px] overflow-hidden relative">
        <div
          className="absolute inset-x-0 top-0 h-6 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, #0A0F1E, transparent)" }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-6 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to top, #0A0F1E, transparent)" }}
        />
        <div
          className="flex flex-col gap-0.5"
          style={{ animation: "tickerScroll 18s linear infinite" }}
        >
          {doubled.map((t, i) => (
            <div
              key={i}
              className="flex justify-between items-center px-2 py-1.5 rounded-md"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "0.5px solid rgba(255,255,255,0.05)",
              }}
            >
              <span className="font-['Space_Grotesk',sans-serif] font-semibold text-[11px] text-[#B0C4DE]">
                {t.sym}
              </span>
              <div className="text-right">
                <div className="font-['Space_Grotesk',sans-serif] text-[10px] text-[#F0F4FF]">
                  {t.price}
                </div>
                <div className={cn("text-[9px] font-['Space_Grotesk',sans-serif]", t.up ? "text-emerald-400" : "text-red-400")}>
                  {t.chg}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes tickerScroll {
          from { transform: translateY(0); }
          to   { transform: translateY(-50%); }
        }
      `}</style>
    </aside>
  )
}