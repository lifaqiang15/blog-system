"use client"

import { useEffect } from "react"
import { useSessionStore } from "@/store/session"

export default function SessionInitializer({
  userId,
  userName,
  role,
}: {
  userId: string
  userName: string
  role: string
}) {
  const setSession = useSessionStore((s) => s.setSession)
  useEffect(() => {
    setSession({ userId, userName, role })
  }, [userId, userName, role, setSession])
  return null
}
