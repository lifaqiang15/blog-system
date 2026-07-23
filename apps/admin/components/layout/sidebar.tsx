"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, PenSquare, FileText, FolderOpen, Tag, MessageSquare, Users } from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "首页", icon: LayoutDashboard },
  { href: "/dashboard/posts/new", label: "新建博客", icon: PenSquare },
  { href: "/dashboard/posts", label: "博客管理", icon: FileText },
  { href: "/dashboard/categories", label: "分类管理", icon: FolderOpen },
  { href: "/dashboard/tags", label: "标签管理", icon: Tag },
  { href: "/dashboard/comments", label: "评论管理", icon: MessageSquare },
  { href: "/dashboard/users", label: "用户管理", icon: Users },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-60 flex-col border-r border-zinc-200 bg-white">
      <div className="flex h-14 items-center border-b border-zinc-200 px-4">
        <span className="font-semibold tracking-tight text-sm">博客管理后台</span>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
