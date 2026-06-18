"use client"
import { Button } from "@/src/components/ui/button";
import axios from "axios"
import { useEffect } from "react";

function Page() {
  const addTestStock = async () => {
    const response = await axios.post('api/watchlist', {
      "symbol": "AAPL",
      "companyName": "Apple Inc"
    })
    console.log(response.data.action);
  }
  const fetchWatchlist = async () => {
    const response = await axios.get('/api/watchlist');
    console.log(response.data.data);
  }
  useEffect(() => {
    fetchWatchlist()
  }, [])

  return (
    <div>
      <Button onClick={addTestStock}>
        Add Apple
      </Button>
    </div>
  )
}

export default Page
