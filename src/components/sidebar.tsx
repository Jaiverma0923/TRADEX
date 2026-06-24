"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  Briefcase,
  Eye,
  ArrowLeftRight,
  LogOut,
  LucideIcon,
} from "lucide-react"

type NavItem = {
  label: string
  href: string
  icon: LucideIcon
}

interface SidebarProps {
  open: boolean
}

const navItems: NavItem[] = [
  { label: "Dashboard",    href: "/dashboard",    icon: LayoutDashboard },
  { label: "Portfolio",    href: "/portfolio",    icon: Briefcase },
  { label: "Watchlist",   href: "/watchlist",    icon: Eye },
  { label: "Transactions", href: "/transactions", icon: ArrowLeftRight },
]

function NavLinks({ collapsed }: { collapsed?: boolean }) {
  const pathname = usePathname()
  return (
    <>
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 font-sans",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
            {isActive && !collapsed && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground opacity-40" />
            )}
          </Link>
        )
      })}
    </>
  )
}

function Sidebar({ open }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col h-screen flex-shrink-0 border-r bg-background transition-[width] duration-300",
          open ? "w-56 px-4 py-6" : "w-16 px-2 py-6"
        )}
      >
        <div className="mb-8 px-2">
          {open ? (
            <>
              <div className="font-bold text-[22px] tracking-tight text-foreground">
                Trade<span className="text-cyan-500">X</span>
              </div>
              <p className="text-[11px] text-muted-foreground tracking-wide mt-0.5">
                Markets never sleep
              </p>
            </>
          ) : (
            <div className="font-bold text-xl text-cyan-500 text-center">TX</div>
          )}
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          <NavLinks collapsed={!open} />
        </nav>

        <div className="mt-6 pt-4 border-t flex items-center gap-2">
          <button
            aria-label="Logout"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center font-sans gap-2 px-3 py-2 rounded-lg text-[12px] font-medium transition-all duration-150 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4" />
            {open && "Logout"}
          </button>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <MobileTabBar />
    </>
  )
}

function MobileTabBar() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 md:hidden bg-background border-t flex items-center justify-around px-2 py-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-[10px] font-medium transition-all min-w-[56px]",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className={cn("h-5 w-5", isActive && "stroke-[2.2]")} />
            <span>{item.label}</span>
          </Link>
        )
      })}

      {/* Logout */}
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-[10px] font-medium transition-all min-w-[56px] text-muted-foreground hover:text-red-500"
      >
        <LogOut className="h-5 w-5" />
        <span>Logout</span>
      </button>
    </nav>
  )
}

export default Sidebar