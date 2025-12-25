import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { ApplyJobDialog } from "./apply-job-dialog"

interface ApplyButtonProps {
    jobId: string
    jobTitle: string
    company: string
}

export function ApplyButton({ jobId, jobTitle, company }: ApplyButtonProps) {
    const { user } = useAuth()
    const router = useRouter()
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const handleApplyClick = () => {
        if (!user) {
            router.push("/login?redirect=/jobs/" + jobId)
            return
        }
        setIsDialogOpen(true)
    }

    return (
        <>
            <Button
                onClick={handleApplyClick}
                className="w-full bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white h-12 text-lg shadow-md transition-all hover:shadow-lg"
            >
                Ứng tuyển ngay
            </Button>

            <ApplyJobDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                jobTitle={jobTitle}
                companyName={company}
                jobId={jobId}
                employerId={(user as any)?.role === 'employer' ? (user as any)?.id : undefined} // Logic might need check, but existing logic used jobId mostly
            />
        </>
    )
}
