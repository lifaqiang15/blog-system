import Sidebar from "@/components/layout/sidebar"

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="h-full flex-1">{children}</div>
    </div>
  )
}
