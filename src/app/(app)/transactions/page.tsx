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

type TransactionFormData = z.input<typeof TransactionSchema>

export default function Page() {
  const [query, setQuery] = useState("")
  const [searchInput,setSearchInput]=useState("")
  const [results, setResults] = useState<Stock[]>([])
  const [isSelected, setIsSelected] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  
  const debounced = useDebounceCallback(setQuery, 300)

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(TransactionSchema),
    defaultValues: {
      symbol: "",
      companyName: "",
      quantity: 0,
      price: 0,
      type: "BUY",
    },
  })

  const type = form.watch("type")
  const selectedSymbol = form.watch("symbol")
  const selectedCompany = form.watch("companyName")

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // Search stocks
  useEffect(() => {
    abortRef.current?.abort()

    if (!query.trim() || isSelected) {
      setResults([])
      setDropdownOpen(false)
      setIsLoading(false)
      return
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
        setResults([])
        setDropdownOpen(false)
      } finally {
        setIsLoading(false)
      }
    }

    search()
  }, [query, isSelected])

  const handleSelect = (stock: Stock) => {
    form.setValue("symbol", stock.symbol, { shouldValidate: true })
    form.setValue("companyName", stock.companyName, { shouldValidate: true })
    setQuery(stock.symbol)
    setSearchInput(stock.symbol);
    setResults([])
    setDropdownOpen(false)
    setIsSelected(true)
  }

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearchInput(val);
    // User is editing — clear selection
    if (isSelected) {
      setIsSelected(false)
      form.setValue("symbol", "")
      form.setValue("companyName", "")
    }
    debounced(val)
  }

  const onSubmit = async (data: TransactionFormData) => {
    try {
      const response = await axios.post("/api/transaction", data)
      toast.success(response.data.message)
      form.reset({ symbol: "", companyName: "", quantity: 0, price: 0, type: "BUY" })
      setQuery("")
      setResults([])
      setIsSelected(false)
      setDropdownOpen(false)
      setSearchInput("")
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>
      toast.error("Something went wrong", {
        description: axiosError.response?.data.message,
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground mt-1">Record stock purchases and sales</p>
      </div>

      <div className="rounded-2xl border bg-card/50 backdrop-blur-sm p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* Stock search */}
          <div ref={dropdownRef} className="relative">
            <label className="text-sm font-medium mb-2 block">Symbol</label>
            <Input
              placeholder="Search stock..."
              value={searchInput}
              onChange={handleQueryChange}
              autoComplete="off"
            />

            {/* Loading indicator */}
            {isLoading && (
              <p className="text-xs text-muted-foreground mt-1.5 ml-1">Searching...</p>
            )}

            {/* Dropdown */}
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

            {/* Selected stock chip */}
            {isSelected && selectedSymbol && (
              <div className="mt-2 flex items-center justify-between px-4 py-3 rounded-xl border bg-cyan-500/5 border-cyan-500/20">
                <div>
                  <p className="font-semibold text-sm">{selectedSymbol}</p>
                  <p className="text-xs text-muted-foreground">{selectedCompany}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    form.setValue("symbol", "")
                    form.setValue("companyName", "")
                    setQuery("")
                    setIsSelected(false)
                    setSearchInput("");
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕ Clear
                </button>
              </div>
            )}

            {/* Symbol validation error */}
            {form.formState.errors.symbol && (
              <p className="text-red-500 text-xs mt-1">{form.formState.errors.symbol.message}</p>
            )}
          </div>

          {/* Quantity + Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Quantity</label>
              <Input
                type="number"
                placeholder="10"
                {...form.register("quantity", { valueAsNumber: true })}
              />
              {form.formState.errors.quantity && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.quantity.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Price Per Share</label>
              <Input
                type="number"
                placeholder="200"
                {...form.register("price", { valueAsNumber: true })}
              />
              {form.formState.errors.price && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.price.message}</p>
              )}
            </div>
          </div>

          {/* Order value preview */}
          {form.watch("quantity") > 0 && form.watch("price") > 0 && (
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-muted/40 text-sm">
              <span className="text-muted-foreground">Estimated order value</span>
              <span className="font-semibold tabular-nums">
                ${(form.watch("quantity") * form.watch("price")).toLocaleString("en-US", { minimumFractionDigits: 2 })}
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
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        <div className="rounded-2xl border bg-card/50 backdrop-blur-sm p-10 text-center">
          <p className="text-muted-foreground">No transactions yet</p>
        </div>
      </div>
    </div>
  )
}