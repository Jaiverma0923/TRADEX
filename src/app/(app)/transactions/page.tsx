"use client"
import { z } from "zod"
import { TransactionSchema } from "@/src/schemas/transactionSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
import axios, { AxiosError } from "axios"
import { toast } from "sonner"
import { ApiResponse } from "@/src/types/apiResponse"
import { useDebounceCallback } from "usehooks-ts"

type Stock = {
  symbol: string
  companyName: string
}

type Transaction = {
  _id: string
  symbol: string
  companyName: string
  quantity: number
  price: number
  type: "BUY" | "SELL"
  createdAt: string
}

type TransactionFormData = z.input<typeof TransactionSchema>

export default function Page() {
  const [query, setQuery] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [results, setResults] = useState<Stock[]>([])
  const [isSelected, setIsSelected] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const debounced = useDebounceCallback(setQuery, 300)

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(TransactionSchema),
    defaultValues: { symbol: "", companyName: "", quantity: 0, price: 0, type: "BUY" },
  })

  const type = form.watch("type")
  const selectedSymbol = form.watch("symbol")
  const selectedCompany = form.watch("companyName")

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  useEffect(() => {
    abortRef.current?.abort()
    if (!query.trim() || isSelected) {
      setResults([]); setDropdownOpen(false); setIsLoading(false); return
    }
    abortRef.current = new AbortController()
    setIsLoading(true)
    const search = async () => {
      try {
        const response = await axios.get(`/api/stocks/search?q=${query.trim()}`, {
          signal: abortRef.current!.signal,
        })
        setResults(response.data)
        setDropdownOpen(response.data.length > 0)
      } catch (err) {
        if (axios.isCancel(err)) return
        setResults([]); setDropdownOpen(false)
      } finally { setIsLoading(false) }
    }
    search()
  }, [query, isSelected])

  const handleSelect = (stock: Stock) => {
    form.setValue("symbol", stock.symbol, { shouldValidate: true })
    form.setValue("companyName", stock.companyName, { shouldValidate: true })
    setQuery(stock.symbol); setSearchInput(stock.symbol)
    setResults([]); setDropdownOpen(false); setIsSelected(true)
  }

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearchInput(val)
    if (isSelected) {
      setIsSelected(false)
      form.setValue("symbol", ""); form.setValue("companyName", "")
    }
    debounced(val)
  }

  const fetchTransactions = async () => {
    try {
      const response = await axios.get("/api/transaction")
      setTransactions(response.data.data)
    } catch (error) { console.error(error) }
  }

  const onSubmit = async (data: TransactionFormData) => {
    try {
      const response = await axios.post("/api/transaction", data)
      toast.success(response.data.message)
      form.reset({ symbol: "", companyName: "", quantity: 0, price: 0, type: "BUY" })
      setQuery(""); setResults([]); setIsSelected(false)
      setDropdownOpen(false); setSearchInput("")
      await fetchTransactions()
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error("Something went wrong", { description: axiosError.response?.data.message })
    }
  }

  useEffect(() => { fetchTransactions() }, [])

  const quantity = Number(form.watch("quantity") ?? 0)
  const price = Number(form.watch("price") ?? 0)

  return (
    <div className="max-w-4xl mx-auto p-3 md:p-6">
      <div className="mb-5 md:mb-8">
        <h1 className="text-xl md:text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground text-sm mt-1">Record stock purchases and sales</p>
      </div>

      <div className="rounded-2xl border bg-card/50 backdrop-blur-sm p-4 md:p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

          {/* Stock search */}
          <div ref={dropdownRef} className="relative">
            <label className="text-sm font-medium mb-2 block">Symbol</label>
            <Input
              placeholder="Search stock..."
              value={searchInput}
              onChange={handleQueryChange}
              autoComplete="off"
            />
            {isLoading && (
              <p className="text-xs text-muted-foreground mt-1.5 ml-1">Searching...</p>
            )}
            {dropdownOpen && results.length > 0 && (
              <div className="absolute z-50 w-full mt-1 max-h-56 overflow-y-auto rounded-xl border bg-background shadow-lg">
                {results.map((stock) => (
                  <button
                    key={`${stock.symbol}-${stock.companyName}`}
                    type="button"
                    className="w-full text-left px-4 py-2.5 hover:bg-accent transition-colors first:rounded-t-xl last:rounded-b-xl"
                    onClick={() => handleSelect(stock)}
                  >
                    <p className="font-medium text-sm">{stock.symbol}</p>
                    <p className="text-xs text-muted-foreground">{stock.companyName}</p>
                  </button>
                ))}
              </div>
            )}
            {isSelected && selectedSymbol && (
              <div className="mt-2 flex items-center justify-between px-4 py-3 rounded-xl border bg-cyan-500/5 border-cyan-500/20">
                <div>
                  <p className="font-semibold text-sm">{selectedSymbol}</p>
                  <p className="text-xs text-muted-foreground">{selectedCompany}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    form.setValue("symbol", ""); form.setValue("companyName", "")
                    setQuery(""); setIsSelected(false); setSearchInput("")
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕ Clear
                </button>
              </div>
            )}
            {form.formState.errors.symbol && (
              <p className="text-red-500 text-xs mt-1">{form.formState.errors.symbol.message}</p>
            )}
          </div>

          {/* Quantity + Price */}
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Quantity</label>
              <Input type="number" placeholder="10" {...form.register("quantity", { valueAsNumber: true })} />
              {form.formState.errors.quantity && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.quantity.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Price Per Share</label>
              <Input type="number" placeholder="200" {...form.register("price", { valueAsNumber: true })} />
              {form.formState.errors.price && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.price.message}</p>
              )}
            </div>
          </div>

          {/* Order value preview */}
          {quantity > 0 && price > 0 && (
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-muted/40 text-sm">
              <span className="text-muted-foreground">Estimated order value</span>
              <span className="font-semibold tabular-nums">
                ${(quantity * price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

          {/* BUY / SELL toggle */}
          <div>
            <label className="text-sm font-medium mb-3 block">Transaction Type</label>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={type === "BUY" ? "default" : "outline"}
                className={`flex-1 ${type === "BUY" ? "bg-emerald-600 hover:bg-emerald-700 text-white border-0" : ""}`}
                onClick={() => form.setValue("type", "BUY")}
              >
                ▲ BUY
              </Button>
              <Button
                type="button"
                variant={type === "SELL" ? "destructive" : "outline"}
                className="flex-1"
                onClick={() => form.setValue("type", "SELL")}
              >
                ▼ SELL
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full rounded-xl" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Submitting..." : "Add Transaction"}
          </Button>
        </form>
      </div>

      {/* Recent transactions */}
      <div className="mt-6 md:mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium">Recent transactions</h2>
          <span className="text-xs text-muted-foreground bg-muted/60 px-3 py-1 rounded-full">
            {transactions.length} trades
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/40 p-10 text-center">
            <p className="text-sm text-muted-foreground">No transactions yet</p>
          </div>
        ) : (
          <>
            {/* Mobile: card list */}
            <div className="md:hidden space-y-2">
              {transactions.map((tx) => {
                const isBuy = tx.type === "BUY"
                const total = tx.quantity * tx.price
                return (
                  <div key={tx._id} className="flex items-center justify-between px-4 py-3 rounded-xl border border-border/40 bg-card/60">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-medium flex-shrink-0"
                        style={{
                          background: isBuy ? "#E1F5EE" : "#FAECE7",
                          color: isBuy ? "#085041" : "#712B13",
                        }}
                      >
                        {tx.symbol.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{tx.symbol.toUpperCase()}</p>
                          <span
                            className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded"
                            style={{
                              background: isBuy ? "#E1F5EE" : "#FAECE7",
                              color: isBuy ? "#085041" : "#712B13",
                            }}
                          >
                            {isBuy ? "↑ Buy" : "↓ Sell"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {tx.quantity} shares · ${tx.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-medium tabular-nums">
                        ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric",
                        })}
                      </p>
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
                    {["Stock", "Type", "Qty", "Price", "Total", "Date"].map((h, i) => (
                      <th
                        key={h}
                        className={`text-[11px] uppercase tracking-wider font-medium text-muted-foreground px-4 py-3 ${i >= 2 ? "text-right" : "text-left"}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => {
                    const isBuy = tx.type === "BUY"
                    const total = tx.quantity * tx.price
                    const avatarClass = isBuy
                      ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                      : "bg-red-500/10 text-red-800 dark:text-red-300"
                    return (
                      <tr key={tx._id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-medium flex-shrink-0 ${avatarClass}`}>
                              {tx.symbol.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium leading-none mb-0.5">{tx.symbol.toUpperCase()}</p>
                              <p className="text-[11px] text-muted-foreground truncate max-w-[120px]">{tx.companyName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md"
                            style={{ background: isBuy ? "#E1F5EE" : "#FAECE7", color: isBuy ? "#085041" : "#712B13" }}
                          >
                            {isBuy ? "↑" : "↓"} {isBuy ? "Buy" : "Sell"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{tx.quantity}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">${tx.price.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right tabular-nums font-medium">
                          ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-right text-[12px] text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}