export async function proxy(request: Request) {
  const url = new URL(request.url)
  if (!url.pathname.startsWith("/dashboard")) return

  const cookies = request.headers.get("cookie") ?? ""
  const hasSession =
    cookies.includes("authjs.session-token") ||
    cookies.includes("__Secure-authjs.session-token")

  if (!hasSession) {
    return Response.redirect(new URL("/auth", request.url))
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
