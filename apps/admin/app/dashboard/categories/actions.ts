"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export type CategoryRow = {
  id: string
  name: string
  description: string | null
  sortOrder: number
  createdAt: Date
}

export async function getCategories(): Promise<CategoryRow[]> {
  return db.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, description: true, sortOrder: true, createdAt: true },
  })
}

export async function createCategoryAction(data: {
  name: string
  description: string
  sortOrder: number
}): Promise<{ data: CategoryRow } | { error: string }> {
  let category: CategoryRow
  try {
    category = await db.category.create({
      data,
      select: { id: true, name: true, description: true, sortOrder: true, createdAt: true },
    })
  } catch {
    return { error: "分类名称已存在" }
  }
  revalidatePath("/dashboard/categories")
  return { data: category }
}

export async function updateCategoryAction(
  id: string,
  data: { name: string; description: string; sortOrder: number }
): Promise<{ error: string } | null> {
  try {
    await db.category.update({ where: { id }, data })
  } catch {
    return { error: "分类名称已存在" }
  }
  revalidatePath("/dashboard/categories")
  return null
}

export async function deleteCategoryAction(id: string): Promise<void> {
  await db.category.delete({ where: { id } })
  revalidatePath("/dashboard/categories")
}
