"use client"

import { useState } from "react"
import Sidebar from "@/components/layout/sidebar"
import Headbar from "@/components/layout/headbar"

interface DashboardShellProps {
  children: React.ReactNode
  userName: string
  userInitial: string
}

export default function DashboardShell({ children, userName, userInitial }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-full">
      <Sidebar collapsed={collapsed} />
      <div className="flex h-full flex-1 flex-col overflow-hidden">
        <Headbar
          collapsed={collapsed}
          onToggle={() => setCollapsed((v) => !v)}
          userName={userName}
          userInitial={userInitial}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
