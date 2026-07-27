import { getPostCategories } from "../actions"
import NewPostClient from "./client"

export default async function NewPostPage() {
  const categories = await getPostCategories()
  return <NewPostClient categories={categories} />
}
