"use server"

import { signIn } from "@/auth"
import { AuthError } from "next-auth"

export async function loginAction(_prev: { error: string } | null, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email?.trim()) return { error: "请输入邮箱" }
  if (!password) return { error: "请输入密码" }

  try {
    await signIn("credentials", { email: email.trim(), password, redirectTo: "/dashboard" })
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.message.includes("账号已被停用")) return { error: "账号已被停用" }
      if (error.message.includes("无后台访问权限")) return { error: "无后台访问权限" }
      return { error: "邮箱或密码错误" }
    }
    throw error
  }

  return null
}
