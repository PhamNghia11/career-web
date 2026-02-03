import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { decrypt } from "@/lib/session"

// 1. Specify protected and public routes
const protectedRoutes = ["/dashboard"]
const adminApiRoutes = ["/api/users"] // Endpoints that ONLY admins should access
const publicRoutes = ["/login", "/register", "/"]

export default async function middleware(req: NextRequest) {
    // 2. Check if the current route is protected or public
    const path = req.nextUrl.pathname
    const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))
    const isAdminApiRoute = adminApiRoutes.some((route) => path.startsWith(route))

    // 3. Decrypt the session from the cookie
    const cookie = req.cookies.get("session")?.value
    const session = await decrypt(cookie)

    // 4. Redirect to /login if the user is not authenticated
    if (isProtectedRoute && !session?.userId) {
        return NextResponse.redirect(new URL("/login", req.nextUrl))
    }

    // 5. Check for Admin privileges on specific API routes
    if (isAdminApiRoute) {
        if (!session?.userId || session.role !== "admin") {
            return NextResponse.json(
                { success: false, error: "Unauthorized: Admin access required" },
                { status: 403 }
            )
        }
    }

    return NextResponse.next()
}

// Routes Middleware should not run on
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)", "/api/users"],
}
