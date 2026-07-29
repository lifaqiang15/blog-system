"use server"

import { del } from "@vercel/blob"
import type { Prisma } from "@prisma/client"
import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import type { PostCardProps } from "@/components/post-card"

type RichTextNode = {
  type?: string
  attrs?: { src?: unknown }
  content?: RichTextNode[]
}

/**
 * 判断给定值是否为当前系统托管的 Vercel Blob 图片地址。
 * @param value 待判断的值。
 * @returns 如果是当前系统托管的图片地址则返回 true，否则返回 false。
 */
function isManagedBlobUrl(value: unknown): value is string {
  if (typeof value !== "string" || !value) return false

  try {
    const url = new URL(value)
    return url.protocol === "https:" && url.hostname.endsWith(".public.blob.vercel-storage.com") && url.pathname.startsWith("/covers/")
  } catch {
    return false
  }
}

/**
 * 从富文本 JSON 中递归提取由当前系统托管的正文图片地址。
 * @param content 博客正文对应的富文本 JSON。
 * @returns 当前正文中引用的托管图片地址列表。
 */
function collectManagedBlobUrlsFromContent(content: unknown): string[] {
  const urls = new Set<string>()

  function visit(node: unknown) {
    if (!node || typeof node !== "object") return

    const richNode = node as RichTextNode
    if (richNode.type === "image" && isManagedBlobUrl(richNode.attrs?.src)) {
      urls.add(richNode.attrs.src)
    }

    for (const child of richNode.content ?? []) visit(child)
  }

  visit(content)
  return [...urls]
}

/**
 * 汇总一篇博客里需要跟踪的托管资源，包括封面图和正文插图。
 * @param post 含封面图和正文内容的博客数据。
 * @returns 该博客引用的托管图片地址集合。
 */
function collectManagedBlobUrls(post: { coverImage: string | null; content: unknown }) {
  const urls = new Set<string>()
  if (isManagedBlobUrl(post.coverImage)) urls.add(post.coverImage)
  for (const url of collectManagedBlobUrlsFromContent(post.content)) urls.add(url)
  return urls
}

/**
 * 将来自客户端的正文内容转换为可安全写入数据库的纯 JSON。
 * @param content 客户端提交的正文内容。
 * @returns 可用于 Prisma Json 字段的纯 JSON 值；为空时返回 undefined。
 */
function normalizePostContent(content: object | null): Prisma.InputJsonValue | undefined {
  if (!content) return undefined
  return JSON.parse(JSON.stringify(content)) as Prisma.InputJsonValue
}

export type PostCategory = { id: string; name: string }

/**
 * 获取博客可用分类，用于新建和编辑表单的分类下拉框。
 * @returns 分类 ID 和名称列表。
 */
export async function getPostCategories(): Promise<PostCategory[]> {
  return db.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  })
}

export type CreatePostInput = {
  title: string
  categoryId: string
  summary: string
  coverImage: string
  status: "DRAFT" | "PUBLISHED"
  content: object | null
}

/**
 * 创建博客，写入基础信息、正文内容和发布时间。
 * @param input 博客创建所需的表单数据。
 * @returns 创建成功时返回新博客 ID，失败时返回错误信息。
 */
export async function createPostAction(
  input: CreatePostInput
): Promise<{ data: { id: string } } | { error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: "请先登录" }

  try {
    const normalizedContent = normalizePostContent(input.content)
    const post = await db.post.create({
      data: {
        title: input.title,
        categoryId: input.categoryId,
        summary: input.summary || null,
        coverImage: input.coverImage || null,
        status: input.status as never,
        content: normalizedContent,
        authorId: session.user.id,
        publishedAt: input.status === "PUBLISHED" ? new Date() : null,
      },
      select: { id: true },
    })
    revalidatePath("/dashboard/posts")
    return { data: { id: post.id } }
  } catch (error) {
    console.error("创建博客失败", {
      userId: session.user.id,
      title: input.title,
      categoryId: input.categoryId,
      status: input.status,
      hasCoverImage: !!input.coverImage,
      hasContent: !!input.content,
      error,
    })
    return { error: "创建博客失败，请重试" }
  }
}

export type PostDetail = {
  id: string
  title: string
  summary: string | null
  coverImage: string | null
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
  content: object | null
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
  authorName: string
  categoryId: string
  categoryName: string
}

/**
 * 按博客 ID 查询详情，供详情页和编辑页回填使用。
 * @param id 博客 ID。
 * @returns 找到时返回博客详情，未找到时返回 null。
 */
export async function getPostById(id: string): Promise<PostDetail | null> {
  const post = await db.post.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      summary: true,
      coverImage: true,
      status: true,
      content: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
      author: { select: { name: true } },
      category: { select: { id: true, name: true } },
    },
  })
  if (!post) return null
  return {
    id: post.id,
    title: post.title,
    summary: post.summary,
    coverImage: post.coverImage,
    status: post.status as PostDetail["status"],
    content: post.content as object | null,
    publishedAt: post.publishedAt,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    authorName: post.author.name ?? "未知",
    categoryId: post.category.id,
    categoryName: post.category.name,
  }
}

export type UpdatePostInput = {
  id: string
  title: string
  categoryId: string
  summary: string
  coverImage: string
  status: "DRAFT" | "PUBLISHED"
  content: object | null
}

/**
 * 更新已有博客，并在首次发布时补上发布时间。
 * @param input 博客更新所需的表单数据。
 * @returns 更新成功返回 null，失败时返回错误信息。
 */
export async function updatePostAction(
  input: UpdatePostInput
): Promise<{ error: string } | null> {
  try {
    const normalizedContent = normalizePostContent(input.content)
    const existing = await db.post.findUnique({
      where: { id: input.id },
      select: { publishedAt: true },
    })
    await db.post.update({
      where: { id: input.id },
      data: {
        title: input.title,
        categoryId: input.categoryId,
        summary: input.summary || null,
        coverImage: input.coverImage || null,
        status: input.status as never,
        content: normalizedContent,
        publishedAt:
          input.status === "PUBLISHED" && !existing?.publishedAt
            ? new Date()
            : existing?.publishedAt ?? null,
      },
    })
    revalidatePath("/dashboard/posts")
    revalidatePath(`/dashboard/posts/${input.id}`)
    return null
  } catch {
    return { error: "保存失败，请重试" }
  }
}

/**
 * 删除博客，并清理不再被其他博客引用的托管图片资源。
 * @param id 要删除的博客 ID。
 * @returns 删除成功返回 null，失败时返回错误信息。
 */
export async function deletePostAction(id: string): Promise<{ error: string } | null> {
  const session = await auth()
  if (!session?.user?.id) return { error: "请先登录" }

  try {
    const post = await db.post.findUnique({
      where: { id },
      select: { coverImage: true, content: true },
    })
    if (!post) return { error: "博客不存在" }

    const currentUrls = collectManagedBlobUrls(post)
    const otherPosts = await db.post.findMany({
      where: { id: { not: id } },
      select: { coverImage: true, content: true },
    })
    const referencedElsewhere = new Set<string>()
    for (const otherPost of otherPosts) {
      for (const url of collectManagedBlobUrls(otherPost)) referencedElsewhere.add(url)
    }

    const urlsToDelete = [...currentUrls].filter((url) => !referencedElsewhere.has(url))

    await db.post.delete({ where: { id } })

    if (urlsToDelete.length > 0) {
      try {
        await del(urlsToDelete)
      } catch (error) {
        console.error("清理博客资源失败", { id, error, urlsToDelete })
      }
    }

    revalidatePath("/dashboard/posts")
    revalidatePath(`/dashboard/posts/${id}`)
    return null
  } catch {
    return { error: "删除博客失败，请重试" }
  }
}

/**
 * 获取博客列表卡片数据，用于后台博客列表页展示。
 * @returns 后台博客列表页所需的卡片数据。
 */
export async function getPosts(): Promise<PostCardProps[]> {
  const posts = await db.post.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      summary: true,
      coverImage: true,
      status: true,
      publishedAt: true,
      createdAt: true,
      author: { select: { name: true } },
      category: { select: { name: true } },
    },
  })

  return posts.map((p) => ({
    id: p.id,
    title: p.title,
    summary: p.summary,
    coverImage: p.coverImage,
    status: p.status as PostCardProps["status"],
    authorName: p.author.name ?? "未知",
    categoryName: p.category.name,
    publishedAt: p.publishedAt,
    createdAt: p.createdAt,
  }))
}
