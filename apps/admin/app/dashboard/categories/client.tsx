"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, Search } from "lucide-react"
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
import type { CategoryRow } from "./actions"
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from "./actions"

const emptyForm = { name: "", description: "", sortOrder: "0" }

export default function CategoriesClient({ initialCategories }: { initialCategories: CategoryRow[] }) {
  const [categories, setCategories] = useState<CategoryRow[]>(initialCategories)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<CategoryRow | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const filtered = categories
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.sortOrder - b.sortOrder)

  function openCreate() {
    setEditingCategory(null)
    setForm(emptyForm)
    setFormError("")
    setDialogOpen(true)
  }

  function openEdit(category: CategoryRow) {
    setEditingCategory(category)
    setForm({
      name: category.name,
      description: category.description ?? "",
      sortOrder: String(category.sortOrder),
    })
    setFormError("")
    setDialogOpen(true)
  }

  function openDelete(category: CategoryRow) {
    setDeletingCategory(category)
    setDeleteDialogOpen(true)
  }

  function handleFormChange(field: keyof typeof emptyForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    if (!form.name.trim()) {
      setFormError("分类名称不能为空")
      return
    }

    const data = {
      name: form.name.trim(),
      description: form.description.trim(),
      sortOrder: Number(form.sortOrder),
    }

    setSubmitting(true)
    try {
      if (editingCategory) {
        const result = await updateCategoryAction(editingCategory.id, data)
        if (result?.error) { setFormError(result.error); return }
        setCategories((prev) =>
          prev.map((c) =>
            c.id === editingCategory.id ? { ...c, ...data } : c
          )
        )
        toast.success("分类已更新")
      } else {
        const result = await createCategoryAction(data)
        if ("error" in result) { setFormError(result.error); return }
        setCategories((prev) => [...prev, result.data])
        toast.success("分类已创建")
      }
      setDialogOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deletingCategory) return
    setSubmitting(true)
    try {
      await deleteCategoryAction(deletingCategory.id)
      setCategories((prev) => prev.filter((c) => c.id !== deletingCategory.id))
      setDeleteDialogOpen(false)
      setDeletingCategory(null)
      toast.success("分类已删除")
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
            placeholder="搜索分类名称..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button onClick={openCreate} size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-sm">
          <Plus className="h-4 w-4" />
          新建分类
        </Button>
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
                  <td className="max-w-60 truncate px-4 py-3 text-zinc-500">
                    {category.description || "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {category.createdAt.toISOString().slice(0, 10)}
                  </td>
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
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
              取消
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-sm"
            >
              {editingCategory ? "保存" : "创建"}
            </Button>
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
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={submitting}>
              取消
            </Button>
            <Button
              onClick={handleDelete}
              disabled={submitting}
              className="bg-red-500 hover:bg-red-600 active:scale-[0.98] text-white shadow-sm"
            >
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
