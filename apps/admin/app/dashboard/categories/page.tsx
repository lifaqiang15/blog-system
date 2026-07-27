import { getCategories } from "./actions"
import CategoriesClient from "./client"

export default async function CategoriesPage() {
  const categories = await getCategories()
  return <CategoriesClient initialCategories={categories} />
}
