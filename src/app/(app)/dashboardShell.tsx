"use client";

import Navbar from "@/src/components/navbar";
import Sidebar from "@/src/components/sidebar";
import { SearchProvider } from "@/src/context/searchContext";
import { useState } from "react";


export default function DashboardShell({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    return (
        <SearchProvider>
            <div className="flex min-h-screen">
                <Sidebar open={sidebarOpen} />
                <div className="flex flex-col flex-1">
                    <Navbar
                        setSidebarOpen={setSidebarOpen}
                    />
                    <main className="flex-1">
                        {children}
                    </main>
                </div>
            </div>
        </SearchProvider>
    );
}