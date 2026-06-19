"use client";

import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ui/theme-toggle";
import { Input } from "./ui/input";
import { Menu } from "lucide-react";
import { useSession } from "next-auth/react";
import { useSearch } from "../context/searchContext";
import { useDebounceCallback } from 'usehooks-ts'
import { useState } from "react";
interface NavbarProps {
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;

}

export default function Navbar({ setSidebarOpen }: NavbarProps) {
  const {setQuery}=useSearch();
  const [searchInput, setSearchInput] = useState("");
  const debounced = useDebounceCallback(setQuery, 300)
  const pathname = usePathname();
  const { data: session } = useSession();
  const initials = session?.user?.name
    ?.split(" ")
    .map((word: string) => word[0])
    .join("")
    .toUpperCase();
  const titleMap: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/portfolio": "Portfolio",
    "/watchlist": "Watchlist",
    "/transactions": "Transactions",
    "/settings": "Settings",
  };

  const title = titleMap[pathname] || "TradeX";

  return (
    <header className="h-16 border-b bg-background px-6 flex items-center">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(prev => !prev)}
          className="p-2 rounded-md hover:bg-accent transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        <h1 className="text-xl font-semibold">
          {title}
        </h1>
      </div>

      {/* Center */}
      <div className="flex-1 flex justify-center ">
        {pathname === "/dashboard" && (
          <Input
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value)
              debounced(e.target.value)}}
            placeholder="Search stocks..."
            className="max-w-md"
          />
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <ThemeToggle />

        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-lg ring-2 ring-background">
          {initials}
        </div>
      </div>
    </header>
  );
}