// 防止未登录用户直接访问/dashboard
export async function proxy(request: Request) {
  const url = new URL(request.url)
  if (!url.pathname.startsWith("/dashboard")) return

  const cookies = request.headers.get("cookie") ?? ""
  const hasSession =
    cookies.includes("authjs.session-token") || //- authjs.session-token — HTTP 环境（开发）  
    cookies.includes("__Secure-authjs.session-token") //- __Secure-authjs.session-token — HTTPS 环境（生产，带 Secure 前缀）

  if (!hasSession) {
    return Response.redirect(new URL("/auth", request.url))
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
