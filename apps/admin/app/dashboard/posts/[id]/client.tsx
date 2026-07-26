"use client"

import Link from "next/link"
import { ArrowLeft, Pencil } from "lucide-react"
import TiptapEditor from "@/components/tiptap"
import type { PostDetail } from "../actions"

const STATUS_LABEL = { DRAFT: "草稿", PUBLISHED: "已发布", ARCHIVED: "已归档" }
const STATUS_STYLE = {
  DRAFT: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  PUBLISHED: "bg-green-50 text-green-700 border border-green-200",
  ARCHIVED: "bg-zinc-100 text-zinc-500 border border-zinc-200",
}

export default function PostDetailClient({ post }: { post: PostDetail }) {
  const date = (post.publishedAt ?? post.createdAt).toISOString().slice(0, 10)

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 flex flex-col gap-6">
      {/* Nav */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/posts"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          返回列表
        </Link>
        <Link
          href={`/dashboard/posts/${post.id}/edit`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.98]"
        >
          <Pencil className="h-4 w-4" />
          编辑
        </Link>
      </div>

      {/* Title & meta */}
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 leading-snug">
          {post.title}
        </h1>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[post.status]}`}>
            {STATUS_LABEL[post.status]}
          </span>
          <span>{post.categoryName}</span>
          <span>·</span>
          <span>{post.authorName}</span>
          <span>·</span>
          <span>{date}</span>
        </div>
      </div>

      {/* Summary */}
      {post.summary && (
        <p className="text-base text-gray-500 leading-relaxed">{post.summary}</p>
      )}

      {/* Divider */}
      <hr className="border-gray-100" />

      {/* Content */}
      {post.content ? (
        <TiptapEditor initialContent={post.content} editable={false} />
      ) : (
        <p className="py-12 text-center text-sm text-gray-300">暂无内容</p>
      )}
    </div>
  )
}
