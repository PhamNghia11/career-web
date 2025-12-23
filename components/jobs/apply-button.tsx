"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Check, Loader2 } from "lucide-react"

interface ApplyButtonProps {
    jobId: string
    jobTitle: string
    company: string
}

export function ApplyButton({ jobId, jobTitle, company }: ApplyButtonProps) {
    const { user } = useAuth()
    const router = useRouter()
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
    const [message, setMessage] = useState("")

    const handleApply = async () => {
        if (!user) {
            router.push("/login?redirect=/jobs/" + jobId)
            return
        }

        setStatus("loading")
        setMessage("")

        try {
            const response = await fetch("/api/applications", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: user?.id,
                    userName: user?.name,
                    userEmail: user?.email,
                    jobId,
                    jobTitle,
                    company,
                }),
            })

            const result = await response.json()

            if (result.success) {
                setStatus("success")
                setMessage("Đã ứng tuyển thành công!")
            } else if (result.error === "Already applied") {
                setStatus("success")
                setMessage("Bạn đã ứng tuyển vị trí này")
            } else {
                setStatus("error")
                setMessage(result.error || "Ứng tuyển thất bại")
            }
        } catch (error) {
            setStatus("error")
            setMessage("Lỗi kết nối. Vui lòng thử lại.")
        }
    }

    if (status === "success") {
        return (
            <div className="space-y-3">
                <Button
                    disabled
                    className="w-full bg-green-600 hover:bg-green-600 text-white h-12 text-lg shadow-md"
                >
                    <Check className="h-5 w-5 mr-2" />
                    Đã ứng tuyển
                </Button>
                <p className="text-center text-sm text-green-600 font-medium">{message}</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <Button
                onClick={handleApply}
                disabled={status === "loading"}
                className="w-full bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white h-12 text-lg shadow-md transition-all hover:shadow-lg"
            >
                {status === "loading" ? (
                    <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Đang xử lý...
                    </>
                ) : (
                    "Ứng tuyển ngay"
                )}
            </Button>
            {status === "error" && (
                <p className="text-center text-sm text-red-600 font-medium">{message}</p>
            )}
        </div>
    )
}
