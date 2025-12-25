import jobsData from "@/data/jobs.json"

export type Job = {
    _id: string
    title: string
    company: string
    companyId: string
    logo?: string
    location: string
    type: "internship" | "full-time" | "part-time" | "freelance"
    field: string
    salary: string
    education?: string
    experience?: string
    salaryMin?: number
    salaryMax?: number
    isNegotiable?: boolean
    deadline: string
    postedAt: string
    description: string
    requirements: string[]
    benefits: string[]
    detailedBenefits?: string[]
    relatedMajors?: string[]
    skills?: string[]
    status: "active" | "closed" | "pending" | "rejected" | "request_changes"
    adminFeedback?: string
    applicants: number
    creatorId?: string // Link to employer user
    views?: number
    website?: string
}

// Support both array format and object format with .jobs property
const rawJobs = Array.isArray(jobsData) ? jobsData : (jobsData as any).jobs || []
export const allJobs: Job[] = rawJobs as Job[]

// Helper function to get jobs by field
export function getJobsByField(field: string): Job[] {
    return allJobs.filter((job) => job.field === field)
}

// Helper function to get jobs by company
export function getJobsByCompany(companyId: string): Job[] {
    return allJobs.filter((job) => job.companyId === companyId)
}

// Helper function to get job by ID
export function getJobById(id: string): Job | undefined {
    return allJobs.find((job) => job._id === id)
}

// Helper function to get featured jobs (latest active jobs)
export function getFeaturedJobs(limit: number = 6): Job[] {
    return allJobs
        .filter((job) => job.status === "active")
        .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())
        .slice(0, limit)
}
