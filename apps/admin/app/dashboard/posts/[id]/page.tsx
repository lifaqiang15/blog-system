import { notFound } from "next/navigation"
import { getPostById } from "../actions"
import PostDetailClient from "./client"

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await getPostById(id)
  if (!post) notFound()
  return <PostDetailClient post={post} />
}
