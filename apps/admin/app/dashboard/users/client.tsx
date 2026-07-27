"use client"

import { useState } from "react"
import { Search, Pencil, ShieldCheck, ShieldOff, UserCheck, UserX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import type { UserRow, UserRole, ApprovalStatus } from "./actions"
import { updateUserAction } from "./actions"
import { useSessionStore } from "@/store/session"

const ROLE_LABEL: Record<UserRole, string> = {
  ADMIN: "管理员",
  AUTHOR: "作者",
  USER: "用户",
}

const APPROVAL_LABEL: Record<ApprovalStatus, string> = {
  PENDING: "待审核",
  APPROVED: "已通过",
  REJECTED: "已拒绝",
}

const ROLE_STYLE: Record<UserRole, string> = {
  ADMIN: "bg-purple-50 text-purple-700 border border-purple-200",
  AUTHOR: "bg-blue-50 text-blue-700 border border-blue-200",
  USER: "bg-zinc-50 text-zinc-600 border border-zinc-200",
}

const APPROVAL_STYLE: Record<ApprovalStatus, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  APPROVED: "bg-green-50 text-green-700 border border-green-200",
  REJECTED: "bg-red-50 text-red-600 border border-red-200",
}

type EditForm = {
  role: UserRole
  approvalStatus: ApprovalStatus
  canAccessAdmin: boolean
  isActive: boolean
}

export default function UsersClient({ initialUsers }: { initialUsers: UserRow[] }) {
  const currentUserId = useSessionStore((s) => s.userId)
  const [users, setUsers] = useState<UserRow[]>(initialUsers)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserRow | null>(null)
  const [form, setForm] = useState<EditForm>({ role: "USER", approvalStatus: "APPROVED", canAccessAdmin: false, isActive: true })
  const [formError, setFormError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.name ?? "").toLowerCase().includes(search.toLowerCase())
  )

  function openEdit(user: UserRow) {
    setEditingUser(user)
    setForm({
      role: user.role,
      approvalStatus: user.approvalStatus,
      canAccessAdmin: user.canAccessAdmin,
      isActive: user.isActive,
    })
    setFormError("")
    setDialogOpen(true)
  }

  async function handleSubmit() {
    if (!editingUser) return
    setSubmitting(true)
    try {
      const result = await updateUserAction(editingUser.id, form)
      if (result?.error) { setFormError(result.error); return }
      setUsers((prev) =>
        prev.map((u) => u.id === editingUser.id ? { ...u, ...form } : u)
      )
      toast.success("用户已更新")
      setDialogOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="搜索邮箱或用户名..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <span className="text-sm text-zinc-400">共 {filtered.length} 位用户</span>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left font-medium text-zinc-500">用户</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500">角色</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500">审核状态</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500">后台访问</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500">账号状态</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500">最近登录</th>
              <th className="px-4 py-3 text-right font-medium text-zinc-500">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-zinc-400">
                  暂无用户数据
                </td>
              </tr>
            ) : (
              filtered.map((user, index) => (
                <tr
                  key={user.id}
                  className={`transition-colors duration-200 hover:bg-zinc-50 ${
                    index !== filtered.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name ?? user.email} className="h-7 w-7 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-200 text-xs font-medium text-zinc-600">
                          {(user.name ?? user.email).charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-medium text-zinc-900">{user.name ?? "—"}</span>
                        <span className="text-xs text-zinc-400">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${ROLE_STYLE[user.role]}`}>
                      {ROLE_LABEL[user.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${APPROVAL_STYLE[user.approvalStatus]}`}>
                      {APPROVAL_LABEL[user.approvalStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {user.canAccessAdmin ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600">
                        <ShieldCheck className="h-3.5 w-3.5" /> 允许
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
                        <ShieldOff className="h-3.5 w-3.5" /> 禁止
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {user.isActive ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600">
                        <UserCheck className="h-3.5 w-3.5" /> 启用
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-red-500">
                        <UserX className="h-3.5 w-3.5" /> 停用
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-400">
                    {user.lastLoginAt ? user.lastLoginAt.toISOString().slice(0, 10) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(user)}
                        aria-label="编辑"
                        disabled={user.id === currentUserId}
                        className="text-gray-500 hover:bg-blue-50 hover:text-blue-600 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑用户</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-700">角色</label>
              <select
                value={form.role}
                onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as UserRole }))}
                className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USER">用户</option>
                <option value="AUTHOR">作者</option>
                <option value="ADMIN">管理员</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-700">审核状态</label>
              <select
                value={form.approvalStatus}
                onChange={(e) => setForm((prev) => ({ ...prev, approvalStatus: e.target.value as ApprovalStatus }))}
                className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PENDING">待审核</option>
                <option value="APPROVED">已通过</option>
                <option value="REJECTED">已拒绝</option>
              </select>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5">
              <div>
                <p className="text-sm font-medium text-zinc-700">允许访问后台</p>
                <p className="text-xs text-zinc-400">独立于角色控制后台入口</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={form.canAccessAdmin}
                onClick={() => setForm((prev) => ({ ...prev, canAccessAdmin: !prev.canAccessAdmin }))}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  form.canAccessAdmin ? "bg-blue-600" : "bg-zinc-200"
                }`}
              >
                <span
                  className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg transition-transform ${
                    form.canAccessAdmin ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2.5">
              <div>
                <p className="text-sm font-medium text-zinc-700">账号启用</p>
                <p className="text-xs text-zinc-400">停用后用户无法登录</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={form.isActive}
                onClick={() => setForm((prev) => ({ ...prev, isActive: !prev.isActive }))}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  form.isActive ? "bg-blue-600" : "bg-zinc-200"
                }`}
              >
                <span
                  className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg transition-transform ${
                    form.isActive ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            {formError && <p className="text-xs text-red-500">{formError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
              取消
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-sm"
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
