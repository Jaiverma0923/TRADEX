"use client"

import Navbar from "@/src/components/navbar"
import Sidebar from "@/src/components/sidebar"
import { SearchProvider } from "@/src/context/searchContext"
import { useState } from "react"

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <SearchProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar open={sidebarOpen} />
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          <Navbar setSidebarOpen={setSidebarOpen} />
          {/* pb-20 clears content above the mobile bottom tab bar */}
          <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
            {children}
          </main>
        </div>
      </div>
    </SearchProvider>
  )
}