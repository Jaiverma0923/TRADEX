
"use client"
import { Button } from '@/src/components/ui/button';
import { useSearch } from '@/src/context/searchContext';
import { ApiResponse } from '@/src/types/apiResponse';
import axios, { AxiosError } from 'axios';
import { Star } from 'lucide-react';
import { useEffect, useState } from 'react'
import { toast } from 'sonner';

type Stock = {
  symbol: string;
  companyName: string;
}

function Page() {
  const { query } = useSearch();
  const [results, setResults] = useState<Stock[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [loadingSymbol, setLoadingSymbol] = useState<string | null>(null);
  const fetchWatchlist = async () => {
    try {
      const response = await axios.get("/api/watchlist");

      setWatchlist(
        response.data.data.map(
          (stock: { symbol: string }) => stock.symbol
        )
      );
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {

    const searchStocks = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      try {
        const response = await axios.get(`/api/stocks/search?q=${query.trim()}`);
        setResults(response.data)
      } catch (error) {
        console.error(error);
      }
    }
    searchStocks();
  }, [query])
  useEffect(() => {
    fetchWatchlist();
  }, []);

  const handleClick = async (data: Stock) => {
    setLoadingSymbol(data.symbol)
    try {
      const response = await axios.post('/api/watchlist', {
        symbol: data.symbol,
        companyName: data.companyName
      })
      toast.success(response.data.action);
      await fetchWatchlist();
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error("something went wrong", {
        description: axiosError.response?.data.message,
      })
    } finally {
      setLoadingSymbol(null);
    }
  }
  return (
    <div className="max-w-5xl mx-auto p-6">
      {results.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Search Results
          </h2>

          <span className="text-sm text-muted-foreground">
            {results.length} found
          </span>
        </div>
      )}

      {query.trim() && (
        <div className="space-y-3 pr-2">
          {results.map((stock) => {
            const isSaved = watchlist.includes(stock.symbol);
            return (
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
                  variant="ghost"
                  size="icon"
                  className="hover:scale-110 transition-transform"
                  disabled={loadingSymbol === stock.symbol}
                >
                  <Star
                    className={`h-6 w-6 ${loadingSymbol === stock.symbol
                      ? "animate-pulse"
                      : isSaved
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                      }`}
                  />
                </Button>
              </div>
            );
          })}
        </div>)}
      {query.trim() && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <h3 className="text-lg font-semibold">
            No stocks found
          </h3>

          <p className="text-muted-foreground text-sm mt-1">
            Try searching with a different symbol or company name
          </p>
        </div>
      )}
    </div>
  )
}

export default Page

