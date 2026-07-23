import Sidebar from "@/components/layout/sidebar"

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="h-full flex-1 bg-[#F53F3F]">{children}</div>
    </div>
  )
}
