import { put } from "@vercel/blob"
import { NextResponse } from "next/server"
import { auth } from "@/auth"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }

  const form = await request.formData()
  const file = form.get("file") as File | null
  if (!file) return NextResponse.json({ error: "缺少文件" }, { status: 400 })
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "只支持图片文件" }, { status: 400 })
  if (file.size > 4.5 * 1024 * 1024) return NextResponse.json({ error: "图片不能超过 4.5MB" }, { status: 400 })

  const blob = await put(`covers/${Date.now()}-${file.name}`, file, { access: "public" })
  return NextResponse.json({ url: blob.url })
}

