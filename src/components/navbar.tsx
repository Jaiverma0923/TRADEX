"use client"

import { usePathname } from "next/navigation"
import { ThemeToggle } from "./ui/theme-toggle"
import { Input } from "./ui/input"
import { Menu } from "lucide-react"
import { useSession } from "next-auth/react"
import { useSearch } from "../context/searchContext"
import { useDebounceCallback } from "usehooks-ts"
import { useState } from "react"

interface NavbarProps {
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function Navbar({ setSidebarOpen }: NavbarProps) {
  const { setQuery } = useSearch()
  const [searchInput, setSearchInput] = useState("")
  const debounced = useDebounceCallback(setQuery, 300)
  const pathname = usePathname()
  const { data: session } = useSession()

  const initials = session?.user?.name
    ?.split(" ")
    .map((word: string) => word[0])
    .join("")
    .toUpperCase()

  const titleMap: Record<string, string> = {
    "/dashboard":    "Dashboard",
    "/portfolio":    "Portfolio",
    "/watchlist":    "Watchlist",
    "/transactions": "Transactions",
    "/settings":     "Settings",
  }
  const title = titleMap[pathname] || "TradeX"
  const isDashboard = pathname === "/dashboard"

  return (
    <header className="h-14 md:h-16 border-b bg-background px-4 md:px-6 flex items-center gap-3">
      {/* Hamburger — desktop only */}
      <button
        onClick={() => setSidebarOpen(prev => !prev)}
        className="hidden md:flex p-2 rounded-md hover:bg-accent transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="text-base md:text-xl font-semibold">{title}</h1>

      {/* Search — inline on mobile, centered on desktop */}
      {isDashboard && (
        <>
          {/* Mobile: inline after title */}
          <div className="flex-1 md:hidden">
            <Input
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value)
                debounced(e.target.value)
              }}
              placeholder="Search stocks..."
              className="h-8 text-sm"
            />
          </div>
          {/* Desktop: centered via absolute */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-full max-w-md px-4">
            <Input
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value)
                debounced(e.target.value)
              }}
              placeholder="Search stocks..."
              className="w-full"
            />
          </div>
        </>
      )}

      <div className="ml-auto flex items-center gap-2 md:gap-4 flex-shrink-0">
        <ThemeToggle />
        <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-white flex items-center justify-center font-bold text-xs md:text-sm shadow-lg ring-2 ring-background">
          {initials}
        </div>
      </div>
    </header>
  )
}