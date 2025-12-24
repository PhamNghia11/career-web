"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, MapPin, DollarSign, Clock, Building, Filter, Bookmark, Briefcase, ChevronRight, Building2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"

import { allJobs } from "@/lib/jobs-data"
import { ApplyJobDialog } from "./apply-job-dialog"

const typeLabels = {
  "full-time": "Toàn thời gian",
  "part-time": "Bán thời gian",
  internship: "Thực tập",
  freelance: "Freelance",
}

const typeColors = {
  "full-time": "bg-blue-50 text-blue-600 font-medium border-transparent px-3 py-1",
  "part-time": "bg-blue-50 text-blue-600 font-medium border-transparent px-3 py-1",
  internship: "bg-blue-50 text-blue-600 font-medium border-transparent px-3 py-1",
  freelance: "bg-blue-50 text-blue-600 font-medium border-transparent px-3 py-1",
}

export function JobsListClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user } = useAuth()

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null)
  const [selectedSalary, setSelectedSalary] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<string>("newest")
  const [savedJobs, setSavedJobs] = useState<string[]>([])
  const [selectedJob, setSelectedJob] = useState<{ title: string; company: string; jobId: string; creatorId?: string } | null>(null)
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false)

  // Load saved jobs from database when user is logged in
  useEffect(() => {
    if (user?.id) {
      loadSavedJobs()
    } else {
      setSavedJobs([])
    }
  }, [user?.id])

  const loadSavedJobs = async () => {
    if (!user?.id) return
    try {
      const response = await fetch(`/api/saved-jobs?userId=${user.id}`)
      const data = await response.json()
      if (data.success && data.jobIds) {
        setSavedJobs(data.jobIds)
      }
    } catch (error) {
      console.error("Error loading saved jobs:", error)
    }
  }

  // Get unique companies with job counts and logos
  const companies = useMemo(() => {
    const companyMap = new Map<string, { name: string; logo: string; count: number }>()
    allJobs.forEach(job => {
      if (companyMap.has(job.company)) {
        const existing = companyMap.get(job.company)!
        existing.count++
      } else {
        companyMap.set(job.company, { name: job.company, logo: job.logo, count: 1 })
      }
    })
    return Array.from(companyMap.values()).sort((a, b) => b.count - a.count)
  }, [])

  const checkSalaryMatch = (jobSalary: string, filterSalary: string) => {
    // Parse job salary (e.g., "5-8 triệu", "10-15 triệu")
    const numbers = jobSalary.match(/\d+/g)?.map(Number)
    if (!numbers || numbers.length === 0) return false

    const minJob = numbers[0]
    const maxJob = numbers.length > 1 ? numbers[1] : minJob

    switch (filterSalary) {
      case "under-5":
        return minJob < 5
      case "5-10":
        return Math.max(minJob, 5) <= Math.min(maxJob, 10)
      case "10-20":
        return Math.max(minJob, 10) <= Math.min(maxJob, 20)
      case "above-20":
        return maxJob >= 20
      default:
        return true
    }
  }

  // Helper function to parse maximum salary from string like "5-8 triệu" or "20-35 triệu"
  const parseMaxSalary = (salary: string): number => {
    const numbers = salary.match(/\d+/g)?.map(Number)
    if (!numbers || numbers.length === 0) return 0
    return Math.max(...numbers)
  }

  const filteredJobs = allJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = !selectedType || job.type === selectedType
    const matchesCompany = !selectedCompany || job.company === selectedCompany
    const matchesSalary = !selectedSalary || checkSalaryMatch(job.salary, selectedSalary)

    return matchesSearch && matchesType && matchesCompany && matchesSalary
  })

  // Apply sorting based on selected sort option
  const sortedJobs = useMemo(() => {
    const jobs = [...filteredJobs]

    switch (sortBy) {
      case "newest":
        // Sort by postedAt date, newest first
        return jobs.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime())
      case "salary":
        // Sort by max salary, highest first
        return jobs.sort((a, b) => parseMaxSalary(b.salary) - parseMaxSalary(a.salary))
      case "deadline":
        // Sort by deadline, soonest first
        return jobs.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      default:
        return jobs
    }
  }, [filteredJobs, sortBy])

  const handleTypeChange = (type: string) => {
    setSelectedType(prev => prev === type ? null : type)
  }

  const handleSalaryChange = (salary: string) => {
    setSelectedSalary(prev => prev === salary ? null : salary)
  }

  const handleCompanyChange = (company: string) => {
    setSelectedCompany(prev => prev === company ? null : company)
  }

  const handleApply = (jobId: string, jobTitle: string, company: string, creatorId?: string) => {
    setSelectedJob({ title: jobTitle, company: company, jobId: jobId, creatorId: creatorId })
    setIsApplyDialogOpen(true)
  }

  const handleSave = async (jobId: string, jobTitle: string) => {
    if (!user) {
      toast({
        title: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để lưu việc làm",
        variant: "destructive",
      })
      return
    }

    try {
      // Optimistic update
      const isSaved = savedJobs.includes(jobId)
      if (isSaved) {
        setSavedJobs(savedJobs.filter((id) => id !== jobId))
      } else {
        setSavedJobs([...savedJobs, jobId])
      }

      const job = allJobs.find(j => j._id === jobId)

      const response = await fetch("/api/saved-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          jobId,
          jobData: {
            title: jobTitle,
            company: job?.company || "",
            logo: job?.logo || "",
            location: job?.location || "",
            salary: job?.salary || "",
            deadline: job?.deadline || "",
            type: job?.type || ""
          }
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: data.saved ? "Đã lưu!" : "Đã bỏ lưu",
          description: data.saved
            ? `Đã lưu ${jobTitle} vào danh sách của bạn`
            : `Đã xóa ${jobTitle} khỏi danh sách lưu`,
        })
      } else {
        // Revert optimistic update on error
        if (isSaved) {
          setSavedJobs([...savedJobs, jobId])
        } else {
          setSavedJobs(savedJobs.filter((id) => id !== jobId))
        }
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Error saving job:", error)
      toast({
        title: "Lỗi",
        description: "Không thể lưu việc làm. Vui lòng thử lại.",
        variant: "destructive",
      })
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedType(null)
    setSelectedCompany(null)
    setSelectedSalary(null)
  }

  const hasActiveFilters = searchQuery || selectedType || selectedCompany || selectedSalary

  const salaryRanges = [
    { id: "under-5", label: "Dưới 5 triệu" },
    { id: "5-10", label: "5 - 10 triệu" },
    { id: "10-20", label: "10 - 20 triệu" },
    { id: "above-20", label: "Trên 20 triệu" },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar Filters */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="sticky top-24 border-none shadow-sm bg-white max-h-[calc(100vh-8rem)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <CardContent className="p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Bộ lọc tìm kiếm
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Từ khóa</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Chức danh, kỹ năng..."
                      className="w-full pl-9 pr-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 border-input"
                    />
                  </div>
                </div>

                <Separator />

                {/* Company Filter */}
                <div>
                  <Label className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Công ty
                  </Label>
                  <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1">
                    {companies.map((company) => (
                      <div
                        key={company.name}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${selectedCompany === company.name
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-gray-50 border border-transparent"
                          }`}
                        onClick={() => handleCompanyChange(company.name)}
                      >
                        <div className="w-8 h-8 rounded-md bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {company.logo ? (
                            <img src={company.logo} alt={company.name} className="w-full h-full object-contain" />
                          ) : (
                            <Building className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm truncate block ${selectedCompany === company.name ? "font-semibold text-primary" : "font-medium"}`}>
                            {company.name}
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${selectedCompany === company.name
                          ? "bg-primary text-white"
                          : "text-muted-foreground bg-gray-100"
                          }`}>
                          {company.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Work Type Filter */}
                <div>
                  <Label className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Hình thức làm việc
                  </Label>
                  <div className="space-y-1">
                    {Object.entries(typeLabels).map(([value, label]) => (
                      <div
                        key={value}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${selectedType === value
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-gray-50 border border-transparent"
                          }`}
                        onClick={() => handleTypeChange(value)}
                      >
                        <span className={`text-sm block flex-1 ${selectedType === value ? "font-semibold text-primary" : "font-medium"}`}>
                          {label}
                        </span>
                        {selectedType === value && <div className="w-2 h-2 rounded-full bg-primary" />}
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Salary Filter */}
                <div>
                  <Label className="text-sm font-medium mb-3 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Mức lương
                  </Label>
                  <div className="space-y-1">
                    {salaryRanges.map((range) => (
                      <div
                        key={range.id}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${selectedSalary === range.id
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-gray-50 border border-transparent"
                          }`}
                        onClick={() => handleSalaryChange(range.id)}
                      >
                        <span className={`text-sm block flex-1 ${selectedSalary === range.id ? "font-semibold text-primary" : "font-medium"}`}>
                          {range.label}
                        </span>
                        {selectedSalary === range.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-3 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Việc làm nổi bật <span className="text-muted-foreground font-normal text-base ml-2">({sortedJobs.length})</span>
          </h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Sắp xếp theo:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border-none bg-transparent font-medium text-foreground focus:ring-0 cursor-pointer"
            >
              <option value="newest">Mới nhất</option>
              <option value="salary">Lương cao nhất</option>
              <option value="deadline">Hạn nộp hồ sơ</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {sortedJobs.map((job) => (
            <Card key={job._id} className="group hover:border-primary/50 transition-all duration-300 bg-white border-gray-100 shadow-sm hover:shadow-md cursor-pointer" onClick={() => router.push(`/jobs/${job._id}`)}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Logo */}
                  <div className="w-16 h-16 rounded-lg border border-gray-100 bg-white p-2 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    {job.logo ? (
                      <img src={job.logo} alt={job.company} className="w-full h-full object-contain" />
                    ) : (
                      <Building className="h-8 w-8 text-gray-400" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#1e3a5f] transition-colors mb-1">
                          {job.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                          <Building className="h-4 w-4" />
                          {job.company}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className={typeColors[job.type as keyof typeof typeColors]}>
                          {typeLabels[job.type as keyof typeof typeLabels]}
                        </Badge>
                        <span className="text-sm text-gray-500 font-medium">{job.postedAt}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-green-600 font-medium">{job.salary}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        Hạn: {job.deadline}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.skills?.map((skill) => (
                        <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-primary hover:bg-transparent -ml-2 font-medium"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSave(job._id, job.title)
                        }}
                      >
                        <Bookmark className={`h-5 w-5 mr-2 ${savedJobs.includes(job._id) ? "fill-primary text-primary" : ""}`} />
                        {savedJobs.includes(job._id) ? "Đã lưu" : "Lưu tin"}
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleApply(job._id, job.title, job.company, job.creatorId)
                        }}
                        className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white shadow-sm px-6"
                      >
                        Ứng tuyển ngay
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {sortedJobs.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Không tìm thấy kết quả</h3>
            <p className="text-gray-500">Vui lòng thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        )}
      </div>
      <ApplyJobDialog
        isOpen={isApplyDialogOpen}
        onClose={() => setIsApplyDialogOpen(false)}
        jobTitle={selectedJob?.title || ""}
        companyName={selectedJob?.company || ""}
        jobId={selectedJob?.jobId}
        employerId={selectedJob?.creatorId}
      />
    </div>
  )
}
