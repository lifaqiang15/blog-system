"use client"

import { useState } from "react"
import Sidebar from "@/components/layout/sidebar"
import Headbar from "@/components/layout/headbar"

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-full">
      <Sidebar collapsed={collapsed} />
      <div className="flex h-full flex-1 flex-col overflow-hidden">
        <Headbar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
