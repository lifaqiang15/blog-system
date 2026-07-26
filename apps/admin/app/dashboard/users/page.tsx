import { getUsers } from "./actions"
import UsersClient from "./client"

export default async function UsersPage() {
  const users = await getUsers()
  return <UsersClient initialUsers={users} />
}
