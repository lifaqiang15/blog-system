import Link from "next/link"
import Image from "next/image"

type PostStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED"

export type PostCardProps = {
  id: string
  title: string
  summary: string | null
  coverImage: string | null
  status: PostStatus
  authorName: string
  categoryName: string
  publishedAt: Date | null
  createdAt: Date
}

const STATUS_LABEL: Record<PostStatus, string> = {
  DRAFT: "草稿",
  PUBLISHED: "已发布",
  ARCHIVED: "已归档",
}

const STATUS_STYLE: Record<PostStatus, string> = {
  DRAFT: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  PUBLISHED: "bg-green-50 text-green-700 border border-green-200",
  ARCHIVED: "bg-zinc-100 text-zinc-500 border border-zinc-200",
}

export default function PostCard({ id, title, summary, coverImage, status, authorName, categoryName, publishedAt, createdAt }: PostCardProps) {
  const date = (publishedAt ?? createdAt).toISOString().slice(0, 10)

  return (
    <Link href={`/dashboard/posts/${id}`} className="block">
      <article className="group flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer">
        {coverImage && (
          <div className="relative h-40 w-full overflow-hidden shrink-0">
            <Image
              src={coverImage}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            />
          </div>
        )}

        <div className="flex flex-col flex-1 gap-2.5 p-4">
          <div className="flex items-center gap-2">
            <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[status]}`}>
              {STATUS_LABEL[status]}
            </span>
            <span className="text-xs text-gray-400">{categoryName}</span>
          </div>

          <h2 className="text-sm font-semibold tracking-tight text-gray-900 line-clamp-2 leading-snug">
            {title}
          </h2>

          {summary && (
            <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
              {summary}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">{authorName}</span>
            <span className="text-xs text-gray-400">{date}</span>
          </div>
        </div>
      </article>
    </Link>
  )
}
