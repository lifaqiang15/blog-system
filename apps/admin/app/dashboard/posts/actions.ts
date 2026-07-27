"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import type { PostCardProps } from "@/components/post-card"

export type PostCategory = { id: string; name: string }

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

export async function createPostAction(
  input: CreatePostInput
): Promise<{ data: { id: string } } | { error: string }> {
  const session = await auth()
  if (!session?.user?.id) return { error: "请先登录" }

  try {
    const post = await db.post.create({
      data: {
        title: input.title,
        categoryId: input.categoryId,
        summary: input.summary || null,
        coverImage: input.coverImage || null,
        status: input.status as never,
        content: input.content ?? undefined,
        authorId: session.user.id,
        publishedAt: input.status === "PUBLISHED" ? new Date() : null,
      },
      select: { id: true },
    })
    revalidatePath("/dashboard/posts")
    return { data: { id: post.id } }
  } catch {
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

export async function updatePostAction(
  input: UpdatePostInput
): Promise<{ error: string } | null> {
  try {
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
        content: input.content ?? undefined,
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
