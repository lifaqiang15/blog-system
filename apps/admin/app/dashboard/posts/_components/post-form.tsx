"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Send, Upload, X } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import dayjs from "dayjs"
import TiptapEditor from "@/components/tiptap"
import type { PostCategory } from "../actions"

export type PostFormValues = {
  title: string
  categoryId: string
  summary: string
  coverImage: string
  content: object | null
}

type MetaInfo = {
  createdAt: Date
  publishedAt: Date | null
  updatedAt: Date
}

type Props = {
  pageTitle: string
  pageDescription: string
  backHref: string
  redirectOnSuccess: string
  categories: PostCategory[]
  initialValues?: Partial<PostFormValues>
  metaInfo?: MetaInfo
  onSubmit: (values: PostFormValues, status: "DRAFT" | "PUBLISHED") => Promise<string | null>
}

export default function PostFormClient({
  pageTitle,
  pageDescription,
  backHref,
  redirectOnSuccess,
  categories,
  initialValues,
  metaInfo,
  onSubmit,
}: Props) {
  const router = useRouter()
  const [title, setTitle] = useState(initialValues?.title ?? "")
  const [categoryId, setCategoryId] = useState(initialValues?.categoryId ?? categories[0]?.id ?? "")
  const [summary, setSummary] = useState(initialValues?.summary ?? "")
  const [coverImage, setCoverImage] = useState(initialValues?.coverImage ?? "")
  const [content, setContent] = useState<object | null>(initialValues?.content ?? null)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileUpload(file: File) {
    if (!file.type.startsWith("image/")) { toast.error("只支持图片文件"); return }
    if (file.size > 4.5 * 1024 * 1024) { toast.error("图片不能超过 4.5MB"); return }
    setUploading(true)
    try {
      const form = new FormData()
      form.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: form })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? "上传失败"); return }
      setCoverImage(data.url)
    } catch {
      toast.error("上传失败，请重试")
    } finally {
      setUploading(false)
    }
  }
  function validate() {
    const e: Record<string, string> = {}
    if (!title.trim()) e.title = "标题不能为空"
    if (!categoryId) e.categoryId = "请选择分类"
    return e
  }

  async function handleSubmit(status: "DRAFT" | "PUBLISHED") {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setErrors({})
    setSubmitting(true)
    try {
      const error = await onSubmit({ title: title.trim(), categoryId, summary: summary.trim(), coverImage: coverImage.trim(), content }, status)
      if (error) { toast.error(error); return }
      toast.success(status === "PUBLISHED" ? "博客已发布" : "草稿已保存")
      router.push(redirectOnSuccess)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={backHref}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm transition-all hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{pageTitle}</h1>
            <p className="mt-0.5 text-sm text-gray-500">{pageDescription}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSubmit("DRAFT")}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-[0.98] disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            存为草稿
          </button>
          <button
            type="button"
            onClick={() => handleSubmit("PUBLISHED")}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            发布博客
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        {/* Left – main content */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="输入博客标题..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">摘要</label>
            <textarea
              placeholder="可选，博客摘要显示在列表卡片中（建议 100 字以内）"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">正文内容</label>
            <TiptapEditor initialContent={initialValues?.content} onChange={setContent} />
          </div>
        </div>

        {/* Right – metadata */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              分类 <span className="text-red-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              {categories.length === 0 && (
                <option value="">暂无分类，请先创建分类</option>
              )}
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">封面图片</label>
            {coverImage ? (
              <div className="relative h-36 w-full overflow-hidden rounded-lg border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverImage}
                  alt="封面预览"
                  className="h-full w-full object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none" }}
                />
                <button
                  type="button"
                  onClick={() => setCoverImage("")}
                  className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex h-36 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 text-gray-400 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-500 disabled:opacity-50"
              >
                <Upload className="h-5 w-5" />
                <span className="text-xs">{uploading ? "上传中..." : "点击上传图片"}</span>
                <span className="text-xs text-gray-300">支持 JPG、PNG、WebP，最大 10MB</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f) }}
            />
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-gray-100" />
              <span className="text-xs text-gray-300">或填写 URL</span>
              <div className="h-px flex-1 bg-gray-100" />
            </div>
            <input
              type="url"
              placeholder="https://..."
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {metaInfo ? (
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs text-gray-500 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-400">创建时间</span>
                <span>{dayjs(metaInfo.createdAt).format("YYYY-MM-DD HH:mm:ss")}</span>
              </div>
              {metaInfo.publishedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-400">发布时间</span>
                  <span>{dayjs(metaInfo.publishedAt).format("YYYY-MM-DD HH:mm:ss")}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">最后更新</span>
                <span>{dayjs(metaInfo.updatedAt).format("YYYY-MM-DD HH:mm:ss")}</span>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-700 leading-relaxed">
              <p className="font-medium mb-1">小提示</p>
              <ul className="list-disc pl-3 space-y-0.5">
                <li>存为草稿后可随时继续编辑</li>
                <li>发布后博客立即对外可见</li>
                <li>封面图建议使用 16:9 比例</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
