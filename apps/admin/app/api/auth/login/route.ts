import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { SignJWT } from "jose"
import { db } from "@/lib/db"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "change-me-in-production"
)

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: "请求格式错误" }, { status: 400 })
  }

  const { email, password } = body as { email?: string; password?: string }

  if (!email || !password) {
    return NextResponse.json({ message: "邮箱和密码不能为空" }, { status: 400 })
  }

  const user = await db.user.findUnique({ where: { email } })

  if (!user || !user.passwordHash) {
    return NextResponse.json({ message: "邮箱或密码错误" }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    return NextResponse.json({ message: "邮箱或密码错误" }, { status: 401 })
  }

  if (!user.isActive) {
    return NextResponse.json({ message: "账号已被停用" }, { status: 403 })
  }

  if (!user.canAccessAdmin) {
    return NextResponse.json({ message: "无后台访问权限" }, { status: 403 })
  }

  await db.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  })

  const token = await new SignJWT({
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET)

  return NextResponse.json({ token })
}
