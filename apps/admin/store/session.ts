import { create } from "zustand"

type SessionState = {
  userId: string
  userName: string
  role: string
  setSession: (payload: { userId: string; userName: string; role: string }) => void
}

export const useSessionStore = create<SessionState>((set) => ({
  userId: "",
  userName: "",
  role: "",
  setSession: (payload) => set(payload),
}))
