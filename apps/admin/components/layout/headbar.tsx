"use client"

import { PanelLeft, ChevronRight, LogOut } from "lucide-react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { logoutAction } from "@/app/dashboard/actions"

const routeLabels: Record<string, string> = {
  overview: "首页",
  posts: "博客管理",
  new: "新建博客",
  categories: "分类管理",
  tags: "标签管理",
  comments: "评论管理",
  users: "用户管理",
}

function Breadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  const crumbs: { label: string }[] = []
  for (const seg of segments) {
    const label = routeLabels[seg]
    if (label) crumbs.push({ label })
  }

  return (
    <nav className="flex items-center gap-1 text-sm text-gray-500">
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-300" />}
          <span className={i === crumbs.length - 1 ? "font-medium text-gray-700" : ""}>
            {crumb.label}
          </span>
        </span>
      ))}
    </nav>
  )
}

interface HeadbarProps {
  collapsed: boolean
  onToggle: () => void
  userName: string
  userInitial: string
}

export default function Headbar({ collapsed, onToggle, userName, userInitial }: HeadbarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          aria-label={collapsed ? "展开侧边栏" : "折叠侧边栏"}
          className="text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
        <Breadcrumb />
      </div>
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
          {userInitial}
        </div>
        <span className="text-sm font-medium text-gray-700">{userName}</span>
        <form action={logoutAction}>
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            aria-label="退出登录"
            className="text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </header>
  )
}
