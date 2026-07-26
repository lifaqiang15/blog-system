"use client"

import PostFormClient from "../../_components/post-form"
import type { PostDetail, PostCategory } from "../../actions"
import { updatePostAction } from "../../actions"

type Props = { post: PostDetail; categories: PostCategory[] }

export default function EditPostClient({ post, categories }: Props) {
  return (
    <PostFormClient
      pageTitle="编辑博客"
      pageDescription="修改内容后保存草稿或重新发布"
      backHref={`/dashboard/posts/${post.id}`}
      redirectOnSuccess={`/dashboard/posts/${post.id}`}
      categories={categories}
      initialValues={{
        title: post.title,
        categoryId: post.categoryId,
        summary: post.summary ?? "",
        coverImage: post.coverImage ?? "",
        content: post.content,
      }}
      metaInfo={{
        createdAt: post.createdAt,
        publishedAt: post.publishedAt,
        updatedAt: post.updatedAt,
      }}
      onSubmit={async (values, status) => {
        const result = await updatePostAction({ id: post.id, ...values, status })
        return result?.error ?? null
      }}
    />
  )
}
