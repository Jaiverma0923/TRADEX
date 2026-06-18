"use client"
import { Button } from '@/src/components/ui/button';
import { useSearch } from '@/src/context/searchContext';
import { ApiResponse } from '@/src/types/apiResponse';
import axios, { AxiosError } from 'axios';
import { useEffect, useState } from 'react'
import { toast } from 'sonner';

type Stock = {
  symbol: string;
  companyName: string;
}

function Page() {
  const { query } = useSearch();
  const [results, setResults] = useState<Stock[]>([]);
  useEffect(() => {
    const searchStocks = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      try {
        const response = await axios.get(`/api/stocks/search?q=${query}`);
        setResults(response.data)
      } catch (error) {
        console.error(error);
      }
    }
    searchStocks();
  }, [query])
  const handleClick = async (data: Stock) => {
    try {
      const response = await axios.post('/api/watchlist', {
        symbol: data.symbol,
        companyName: data.companyName
      })
      toast.success(response.data.action);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error("something went wrong", {
        description: axiosError.response?.data.message,
      })
    }
  }
  return (
    <div className="max-w-5xl mx-auto p-6">
      {results.length > 0 && (
        <h2 className="text-lg font-semibold mb-4">
          Search Results
        </h2>
      )}

      {query.trim() && (
        <div className="space-y-3 max-h-[calc(100vh-180px)] overflow-y-auto pr-2">
          {results.map((stock) => (
            <div
              key={`${stock.symbol}-${stock.companyName}`}
              className="group flex items-center justify-between p-5 rounded-2xl border bg-card/50 backdrop-blur-sm hover:bg-card hover:border-cyan-500/30 transition-all duration-200 "
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                  <span className="font-bold text-cyan-400">
                    {stock.symbol.slice(0, 2)}
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold text-lg tracking-tight">
                    {stock.symbol}
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    {stock.companyName}
                  </p>
                </div>
              </div>

              <Button
                onClick={() => handleClick(stock)}
                variant="outline"
                className="rounded-xl px-5 hover:bg-cyan-500 hover:text-black transition-all"
              >
                Add
              </Button>
            </div>
          ))}
        </div>)}
    </div>
  )
}

export default Page
