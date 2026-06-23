import type { Metadata } from "next";
import { auth } from "../api/auth/[...nextauth]/option";
import { redirect } from "next/navigation";
import DashboardShell from "./dashboardShell";
export const metadata = {
  title: "TradeX",
  description: "Track, analyze and manage your stock portfolio",
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const session = await auth();
  if (!session) {
    redirect('/login');
  }

  return (
     <DashboardShell>
      {children}
     </DashboardShell>
  );
}
