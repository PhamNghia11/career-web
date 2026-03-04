import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { decrypt } from "@/lib/session"

// 1. Specify protected and public routes
const protectedRoutes = ["/dashboard"]
const sensitiveApiRoutes = ["/api/applications", "/api/users"]
const publicRoutes = ["/login", "/register", "/"]

export default async function middleware(req: NextRequest) {
    const start = Date.now()
    const path = req.nextUrl.pathname
    // ... rest of logic will be inside a try/finally to log duration
    try {
        const res = await handleMiddleware(req)
        return res
    } finally {
        const duration = Date.now() - start
        if (duration > 50) {
            console.log(`[Middleware] [Slow] ${path} took ${duration}ms`)
        }
    }
}

async function handleMiddleware(req: NextRequest) {
    const path = req.nextUrl.pathname
    const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))
    const isSensitiveApiRoute = sensitiveApiRoutes.some((route) => path.startsWith(route))

    // 3. Decrypt the session from the cookie
    const cookie = req.cookies.get("session")?.value
    const session = await decrypt(cookie)
    console.log(`[Middleware Debug] Path: ${path}, Cookie Present: ${!!cookie}, Session Decrypted: ${!!session}`)

    // 4. Redirect to /login if the user is not authenticated (for UI routes)
    if (isProtectedRoute && !session?.userId) {
        console.log(`[Middleware Debug] Unauthorized access to ${path}, redirecting to /login`)
        return NextResponse.redirect(new URL("/login", req.nextUrl))
    }

    // 5. Check for Auth on sensitive API routes
    if (isSensitiveApiRoute) {
        if (!session?.userId) {
            return NextResponse.json(
                { success: false, error: "Unauthorized: Authentication required" },
                { status: 401 }
            )
        }

        // Special case for /api/users (LIST) - strictly Admin
        // Match exact path or trailing slash, but NOT sub-paths like /api/users/[id]
        const isUserListRoute = path === "/api/users" || path === "/api/users/"
        if (isUserListRoute && session.role !== "admin") {
            return NextResponse.json(
                { success: false, error: "Forbidden: Admin access only" },
                { status: 403 }
            )
        }

        // Note: Individual user routes /api/users/[id] are handled inside the route.ts 
        // to check if session.userId matches the requested ID.
    }

    return NextResponse.next()
}

// Routes Middleware should not run on
export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.ico$).*)",
    ],
}
