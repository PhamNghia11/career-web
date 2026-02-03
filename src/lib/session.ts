import { SignJWT, jwtVerify } from "jose"

const secretKey = process.env.SESSION_SECRET || "default_secret_key_change_me"
const encodedKey = new TextEncoder().encode(secretKey)

export async function encrypt(payload: any) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(encodedKey)
}

export async function decrypt(session: string | undefined = "") {
    try {
        const { payload } = await jwtVerify(session, encodedKey, {
            algorithms: ["HS256"],
        })
        return payload
    } catch (error) {
        return null
    }
}

export async function createSession(userId: string, role: string) {
    const { cookies } = await import("next/headers")
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const session = await encrypt({ userId, role, expiresAt })
    const cookieStore = await cookies()

    cookieStore.set("session", session, {
        httpOnly: true,
        secure: false, // Set to false to allow HTTP on local network (10.0.16.213)
        expires: expiresAt,
        sameSite: "lax",
        path: "/",
    })
}

export async function deleteSession() {
    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()
    cookieStore.delete("session")
}
