import { getPosts } from "./actions"
import PostsClient from "./client"

export default async function PostsPage() {
  const posts = await getPosts()
  return <PostsClient posts={posts} />
}
