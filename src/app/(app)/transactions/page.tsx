"use client"
import { z } from "zod";
import { TransactionSchema } from "@/src/schemas/transactionSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { ApiResponse } from "@/src/types/apiResponse";

type Stock = {
  symbol: string;
  companyName: string;
}
type TransactionFormData = z.input<typeof TransactionSchema>
export default function Page() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Stock[]>([]);
  const form = useForm<TransactionFormData>({
    resolver: zodResolver(TransactionSchema),
    defaultValues: {
      symbol: "",
      companyName: "",
      quantity: 0,
      price: 0,
      type: "BUY",
    }
  })
  useEffect(() => {
    const searchStocks = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      const response = await axios.get(
        `/api/stocks/search?q=${query.trim()}`
      );

      setResults(response.data);
    };

    searchStocks();
  }, [query]);
  const type = form.watch("type");
  const onSubmit = async (data: TransactionFormData) => {
    try {
      const response = await axios.post("/api/transaction",
        data
      );
      toast.success(response.data.message);
      form.reset({
        symbol: "",
        companyName: "",
        quantity: 0,
        price: 0,
        type: "BUY",
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error("Something went wrong", {
        description: axiosError.response?.data.message,
      });
    }
  };
  const selectedSymbol = form.watch("symbol");
const selectedCompany =
  form.watch("companyName");

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Transactions
        </h1>

        <p className="text-muted-foreground mt-1">
          Record stock purchases and sales
        </p>
      </div>

      <div className="rounded-2xl border bg-card/50 backdrop-blur-sm p-6">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Symbol
              </label>

              <Input
                placeholder="Search stock..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="space-y-2 mt-3">
  {results.map((stock) => (
    <button
      key={stock.symbol}
      type="button"
      className="
        w-full
        text-left
        p-3
        rounded-xl
        border
        hover:bg-accent
      "
      onClick={() => {
        form.setValue("symbol", stock.symbol);
        form.setValue(
          "companyName",
          stock.companyName
        );

        setQuery(stock.symbol);
        setResults([]);
      }}
    >
      <p className="font-medium">
        {stock.symbol}
      </p>

      <p className="text-sm text-muted-foreground">
        {stock.companyName}
      </p>
    </button>
  ))}
</div>
{selectedSymbol && (
  <div className="
    p-4
    rounded-xl
    border
    bg-cyan-500/5
  ">
    <p className="font-semibold">
      {selectedSymbol}
    </p>

    <p className="text-sm text-muted-foreground">
      {selectedCompany}
    </p>
  </div>
)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Quantity
              </label>

              <Input
                type="number"
                placeholder="10"
                {...form.register("quantity", {
                  valueAsNumber: true,
                })}
              />

              {form.formState.errors.quantity && (
                <p className="text-red-500 text-xs mt-1">
                  {form.formState.errors.quantity.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Price Per Share
              </label>

              <Input
                type="number"
                placeholder="200"
                {...form.register("price", {
                  valueAsNumber: true,
                })}
              />

              {form.formState.errors.price && (
                <p className="text-red-500 text-xs mt-1">
                  {form.formState.errors.price.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">
              Transaction Type
            </label>

            <div className="flex gap-3">
              <Button
                type="button"
                variant={
                  type === "BUY"
                    ? "default"
                    : "outline"
                }
                className="flex-1"
                onClick={() =>
                  form.setValue("type", "BUY")
                }
              >
                BUY
              </Button>

              <Button
                type="button"
                variant={
                  type === "SELL"
                    ? "destructive"
                    : "outline"
                }
                className="flex-1"
                onClick={() =>
                  form.setValue("type", "SELL")
                }
              >
                SELL
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full rounded-xl"
          >
            Add Transaction
          </Button>
        </form>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">
          Recent Transactions
        </h2>

        <div className="rounded-2xl border bg-card/50 backdrop-blur-sm p-10 text-center">
          <p className="text-muted-foreground">
            No transactions yet
          </p>
        </div>
      </div>
    </div>
  );
}