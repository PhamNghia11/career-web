export interface User {
  id: string
  email: string
  name: string
  role: "student" | "employer" | "admin"
  avatar?: string
  phone?: string
  studentId?: string
  major?: string
  createdAt: Date
  updatedAt: Date
}

export interface Job {
  id: string
  title: string
  company: string
  location: string
  type: "full-time" | "part-time" | "internship" | "freelance"
  salary: string
  description: string
  requirements: string[]
  benefits: string[]
  postedBy: string
  createdAt: Date
  deadline: Date
  applicants: number
  status: "active" | "closed" | "draft"
}

export interface GoogleReview {
  id: string
  author: string
  rating: number
  content: string
  date: Date
  profilePhoto?: string
  likes: number
}

export interface DailyUpdate {
  id: string
  userId: string
  content: string
  type: "job" | "event" | "announcement"
  createdAt: Date
  views: number
}
