import { auth } from "@/auth"
import { redirect } from "next/navigation"
import DashboardShell from "@/components/layout/dashboard-shell"

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth()
  if (!session?.user) redirect("/auth")

  const userName = session.user.name ?? session.user.email ?? "用户"
  const userInitial = userName.charAt(0)

  return (
    <DashboardShell userName={userName} userInitial={userInitial}>
      {children}
    </DashboardShell>
  )
}
