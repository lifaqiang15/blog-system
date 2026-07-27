"use server"

import { db } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export type UserRole = "ADMIN" | "AUTHOR" | "USER"
export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED"

export type UserRow = {
  id: string
  email: string
  name: string | null
  avatar: string | null
  role: UserRole
  approvalStatus: ApprovalStatus
  canAccessAdmin: boolean
  isActive: boolean
  createdAt: Date
  lastLoginAt: Date | null
}

export async function getUsers(): Promise<UserRow[]> {
  const rows = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      role: true,
      approvalStatus: true,
      canAccessAdmin: true,
      isActive: true,
      createdAt: true,
      lastLoginAt: true,
    },
  })
  return rows as unknown as UserRow[]
}

export async function updateUserAction(
  id: string,
  data: {
    role: UserRole
    approvalStatus: ApprovalStatus
    canAccessAdmin: boolean
    isActive: boolean
  }
): Promise<{ error: string } | null> {
  const session = await auth()
  if (session?.user?.id === id) {
    return { error: "不能修改自己的角色、审核状态或访问权限" }
  }

  if (data.role === "ADMIN") {
    const existing = await db.user.findFirst({
      where: { role: "ADMIN" as never, id: { not: id } },
    })
    if (existing) {
      return { error: "系统中已存在管理员，不能设置多个管理员" }
    }
  }
  try {
    await db.user.update({
      where: { id },
      data: {
        role: data.role as never,
        approvalStatus: data.approvalStatus as never,
        canAccessAdmin: data.canAccessAdmin,
        isActive: data.isActive,
      },
    })
  } catch {
    return { error: "更新用户失败" }
  }
  revalidatePath("/dashboard/users")
  return null
}
