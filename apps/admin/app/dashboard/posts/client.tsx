"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import Link from "next/link"
import PostCard, { type PostCardProps } from "@/components/post-card"

const PAGE_SIZE = 9

export default function PostsClient({ posts }: { posts: PostCardProps[] }) {
  const [page, setPage] = useState(1)
  const total = posts.length
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const pagePosts = posts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">博客</h1>
          <p className="mt-0.5 text-sm text-gray-500">共 {total} 篇博客</p>
        </div>
        <Link
          href="/dashboard/posts/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-blue-700 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          新建博客
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {pagePosts.map((post) => (
          <PostCard key={post.id} {...post} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow disabled:cursor-not-allowed disabled:opacity-30 active:scale-[0.98]"
            aria-label="上一页"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 active:scale-[0.98] ${
                p === page
                  ? "bg-blue-600 text-white shadow-sm"
                  : "border border-gray-200 bg-white text-gray-600 shadow-sm hover:bg-slate-50 hover:shadow"
              }`}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow disabled:cursor-not-allowed disabled:opacity-30 active:scale-[0.98]"
            aria-label="下一页"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
