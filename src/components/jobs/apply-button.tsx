"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { ApplyJobDialog } from "./apply-job-dialog"

interface ApplyButtonProps {
    jobId: string
    jobTitle: string
    company: string
    employerId?: string
    companyEmail?: string
    companyPhone?: string
    companyWebsite?: string
    jobType?: string
    deadline?: string
}

export function ApplyButton({
    jobId,
    jobTitle,
    company,
    employerId,
    companyEmail,
    companyPhone,
    companyWebsite,
    jobType,
    deadline
}: ApplyButtonProps) {
    const { user } = useAuth()
    const router = useRouter()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const isEmployer = user?.role === "employer" || user?.role === "admin"
    const isExpired = deadline && new Date(deadline).getTime() > 0 && new Date(deadline).getTime() < new Date().getTime()

    const handleApplyClick = () => {
        if (!user) {
            router.push("/login?redirect=/jobs/" + jobId)
            return
        }
        if (isEmployer) return
        setIsDialogOpen(true)
    }

    return (
        <>
            <Button
                onClick={handleApplyClick}
                disabled={!!isExpired || isEmployer}
                className={`w-full h-12 text-lg shadow-md transition-all hover:shadow-lg ${isExpired || isEmployer ? "bg-gray-100 text-gray-400 hover:bg-gray-100 cursor-not-allowed" : "bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white"}`}
            >
                {isExpired ? "Đã hết hạn" : isEmployer ? "Chỉ dành cho ứng viên" : "Ứng tuyển ngay"}
            </Button>

            <ApplyJobDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                jobTitle={jobTitle}
                companyName={company}
                jobId={jobId}
                employerId={employerId}
                companyEmail={companyEmail}
                companyPhone={companyPhone}
                companyWebsite={companyWebsite}
                jobType={jobType}
            />
        </>
    )
}
