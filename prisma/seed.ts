import "dotenv/config"
import bcrypt from "bcryptjs"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

const EMAIL = process.env.ADMIN_EMAIL
const PASSWORD = process.env.ADMIN_PASSWORD
const NAME = process.env.ADMIN_NAME

const missing = ["ADMIN_EMAIL", "ADMIN_PASSWORD", "ADMIN_NAME"].filter(
  (k) => !process.env[k]
)
if (missing.length > 0) {
  console.error(`缺少必要的环境变量: ${missing.join(", ")}`)
  console.error("请在 .env 中设置后重新运行。")
  process.exit(1)
}

async function main() {
  const existing = await db.user.findUnique({ where: { email: EMAIL } })
  if (existing) {
    console.log(`用户 ${EMAIL} 已存在，跳过创建。`)
    return
  }

  const passwordHash = await bcrypt.hash(PASSWORD!, 12)

  const user = await db.user.create({
    data: {
      email: EMAIL!,
      passwordHash,
      name: NAME,
      role: "ADMIN",
      approvalStatus: "APPROVED",
      canAccessAdmin: true,
      isActive: true,
    },
  })

  console.log(`✓ 管理员用户已创建`)
  console.log(`  ID:    ${user.id}`)
  console.log(`  邮箱:  ${user.email}`)
  console.log(`  姓名:  ${user.name}`)
  console.log(`  密码:  ${PASSWORD}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
