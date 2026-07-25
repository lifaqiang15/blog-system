"use client"

import { useState } from "react"
import { FolderOpen, Plus, Pencil, Trash2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface Category {
  id: string
  name: string
  description: string
  sortOrder: number
  createdAt: string
}

const initialCategories: Category[] = [
  { id: "1", name: "技术", description: "技术相关文章", sortOrder: 0, createdAt: "2024-01-10" },
  { id: "2", name: "生活", description: "生活随笔", sortOrder: 1, createdAt: "2024-01-15" },
  { id: "3", name: "前端", description: "前端开发技术", sortOrder: 2, createdAt: "2024-02-01" },
  { id: "4", name: "后端", description: "后端开发技术", sortOrder: 3, createdAt: "2024-02-10" },
  { id: "5", name: "随笔", description: "日常随笔", sortOrder: 4, createdAt: "2024-03-01" },
]

const emptyForm = { name: "", description: "", sortOrder: "0" }

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState("")

  const filtered = categories
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.sortOrder - b.sortOrder)

  function openCreate() {
    setEditingCategory(null)
    setForm(emptyForm)
    setFormError("")
    setDialogOpen(true)
  }

  function openEdit(category: Category) {
    setEditingCategory(category)
    setForm({ name: category.name, description: category.description, sortOrder: String(category.sortOrder) })
    setFormError("")
    setDialogOpen(true)
  }

  function openDelete(category: Category) {
    setDeletingCategory(category)
    setDeleteDialogOpen(true)
  }

  function handleFormChange(field: keyof typeof emptyForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit() {
    if (!form.name.trim()) {
      setFormError("分类名称不能为空")
      return
    }
    const nameExists = categories.some(
      (c) => c.name === form.name.trim() && c.id !== editingCategory?.id
    )
    if (nameExists) {
      setFormError("分类名称已存在")
      return
    }

    if (editingCategory) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? { ...c, name: form.name.trim(), description: form.description.trim(), sortOrder: Number(form.sortOrder) }
            : c
        )
      )
    } else {
      const newCategory: Category = {
        id: String(Date.now()),
        name: form.name.trim(),
        description: form.description.trim(),
        sortOrder: Number(form.sortOrder),
        createdAt: new Date().toISOString().slice(0, 10),
      }
      setCategories((prev) => [...prev, newCategory])
    }
    setDialogOpen(false)
  }

  function handleDelete() {
    if (!deletingCategory) return
    setCategories((prev) => prev.filter((c) => c.id !== deletingCategory.id))
    setDeleteDialogOpen(false)
    setDeletingCategory(null)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-zinc-500" />
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900">分类管理</h1>
          <span className="ml-1 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500">
            {categories.length}
          </span>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-sm">
          <Plus className="h-4 w-4" />
          新建分类
        </Button>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <Input
          placeholder="搜索分类名称..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left font-medium text-zinc-500">名称</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500">描述</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500">创建时间</th>
              <th className="px-4 py-3 text-right font-medium text-zinc-500">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-zinc-400">
                  暂无分类数据
                </td>
              </tr>
            ) : (
              filtered.map((category, index) => (
                <tr
                  key={category.id}
                  className={`transition-colors duration-200 hover:bg-zinc-50 ${
                    index !== filtered.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-zinc-900">{category.name}</td>
                  <td className="max-w-[240px] truncate px-4 py-3 text-zinc-500">
                    {category.description || "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{category.createdAt}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(category)}
                        aria-label="编辑"
                        className="text-gray-500 hover:bg-blue-50 hover:text-blue-600 active:scale-[0.98]"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openDelete(category)}
                        aria-label="删除"
                        className="text-gray-500 hover:bg-red-50 hover:text-red-600 active:scale-[0.98]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "编辑分类" : "新建分类"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-700">
                名称 <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="输入分类名称"
                value={form.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-700">描述</label>
              <Input
                placeholder="可选，简短描述该分类"
                value={form.description}
                onChange={(e) => handleFormChange("description", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-700">排序</label>
              <Input
                type="number"
                placeholder="0"
                value={form.sortOrder}
                onChange={(e) => handleFormChange("sortOrder", e.target.value)}
              />
              <p className="text-xs text-zinc-400">数值越小排序越靠前</p>
            </div>
            {formError && <p className="text-xs text-red-500">{formError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-sm">{editingCategory ? "保存" : "创建"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <p className="py-2 text-sm text-zinc-600">
            确定要删除分类「
            <span className="font-medium text-zinc-900">{deletingCategory?.name}</span>
            」吗？此操作不可撤销。
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleDelete} className="bg-red-500 hover:bg-red-600 active:scale-[0.98] text-white shadow-sm">
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
