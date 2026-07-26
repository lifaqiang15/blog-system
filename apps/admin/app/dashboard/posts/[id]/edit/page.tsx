import { notFound } from "next/navigation"
import { getPostById, getPostCategories } from "../../actions"
import EditPostClient from "./client"

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [post, categories] = await Promise.all([getPostById(id), getPostCategories()])
  if (!post) notFound()
  return <EditPostClient post={post} categories={categories} />
}
