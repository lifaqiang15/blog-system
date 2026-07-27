"use client"

import PostFormClient from "../_components/post-form"
import type { PostCategory } from "../actions"
import { createPostAction } from "../actions"

export default function NewPostClient({ categories }: { categories: PostCategory[] }) {
  return (
    <PostFormClient
      pageTitle="新建博客"
      pageDescription="填写内容后保存为草稿或直接发布"
      backHref="/dashboard/posts"
      redirectOnSuccess="/dashboard/posts"
      categories={categories}
      onSubmit={async (values, status) => {
        const result = await createPostAction({ ...values, status })
        return "error" in result ? result.error : null
      }}
    />
  )
}
