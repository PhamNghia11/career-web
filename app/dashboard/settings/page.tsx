"use client"

import type React from "react"

import { useState } from "react"
import { Upload, Download, Database, RefreshCw, Check, AlertCircle, Lock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"

export default function SettingsPage() {
  const { user } = useAuth()
  const [importStatus, setImportStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [importMessage, setImportMessage] = useState("")

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordStatus, setPasswordStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [passwordMessage, setPasswordMessage] = useState("")

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImportStatus("loading")
    setImportMessage("")

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", type)

      const response = await fetch("/api/csv/import", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setImportStatus("success")
        setImportMessage(`Đã import ${result.data.count} bản ghi thành công`)
      } else {
        setImportStatus("error")
        setImportMessage(result.error)
      }
    } catch (error) {
      setImportStatus("error")
      setImportMessage("Lỗi khi import file")
    }
  }

  const handleExport = async (type: string) => {
    try {
      const response = await fetch(`/api/csv/export?type=${type}`)
      const blob = await response.blob()

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${type}_export_${Date.now()}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Export failed:", error)
    }
  }

  const handleChangePassword = async () => {
    // Reset status
    setPasswordStatus("idle")
    setPasswordMessage("")

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordStatus("error")
      setPasswordMessage("Vui lòng điền đầy đủ thông tin")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus("error")
      setPasswordMessage("Mật khẩu mới không khớp")
      return
    }

    if (newPassword.length < 6) {
      setPasswordStatus("error")
      setPasswordMessage("Mật khẩu mới phải có ít nhất 6 ký tự")
      return
    }

    setPasswordStatus("loading")

    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
          currentPassword,
          newPassword,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setPasswordStatus("success")
        setPasswordMessage("🎉 Đổi mật khẩu thành công!")
        // Clear form
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        setPasswordStatus("error")
        setPasswordMessage(result.error || "Đổi mật khẩu thất bại")
      }
    } catch (error) {
      setPasswordStatus("error")
      setPasswordMessage("Lỗi kết nối. Vui lòng thử lại.")
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Cài đặt</h1>
        <p className="text-muted-foreground mt-1">Quản lý cài đặt tài khoản và hệ thống</p>
      </div>

      {/* Security Settings - Moved to top */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Bảo mật
          </CardTitle>
          <CardDescription>Quản lý mật khẩu và bảo mật tài khoản</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Password Change Status */}
          {passwordStatus !== "idle" && (
            <div
              className={`p-4 rounded-lg flex items-center gap-3 ${passwordStatus === "loading"
                ? "bg-blue-50 text-blue-700"
                : passwordStatus === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
                }`}
            >
              {passwordStatus === "loading" && <RefreshCw className="h-5 w-5 animate-spin" />}
              {passwordStatus === "success" && <Check className="h-5 w-5" />}
              {passwordStatus === "error" && <AlertCircle className="h-5 w-5" />}
              <span className="font-medium">{passwordStatus === "loading" ? "Đang xử lý..." : passwordMessage}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Nhập mật khẩu hiện tại"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">Mật khẩu mới</Label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={passwordStatus === "loading"}
            className="w-full sm:w-auto"
          >
            {passwordStatus === "loading" ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Đổi mật khẩu"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Thông báo</CardTitle>
          <CardDescription>Quản lý cách bạn nhận thông báo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Thông báo email</p>
              <p className="text-sm text-muted-foreground">Nhận thông báo qua email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Thông báo push</p>
              <p className="text-sm text-muted-foreground">Nhận thông báo trên trình duyệt</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Thông báo việc làm mới</p>
              <p className="text-sm text-muted-foreground">Nhận thông báo khi có việc làm phù hợp</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Data Management - Admin Only */}
      {user?.role === "admin" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Quản lý dữ liệu
            </CardTitle>
            <CardDescription>Import/Export dữ liệu CSV và quản lý MongoDB</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Import Status */}
            {importStatus !== "idle" && (
              <div
                className={`p-4 rounded-lg flex items-center gap-3 ${importStatus === "loading"
                  ? "bg-blue-50 text-blue-700"
                  : importStatus === "success"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                  }`}
              >
                {importStatus === "loading" && <RefreshCw className="h-5 w-5 animate-spin" />}
                {importStatus === "success" && <Check className="h-5 w-5" />}
                {importStatus === "error" && <AlertCircle className="h-5 w-5" />}
                <span>{importStatus === "loading" ? "Đang xử lý..." : importMessage}</span>
              </div>
            )}

            {/* Import Section */}
            <div>
              <Label className="text-base font-medium">Import dữ liệu CSV</Label>
              <p className="text-sm text-muted-foreground mb-4">Upload file CSV để import dữ liệu vào hệ thống</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="import-jobs" className="text-sm">
                    Import Việc làm
                  </Label>
                  <div className="mt-2">
                    <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted transition-colors">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm">Chọn file CSV</span>
                      <input
                        id="import-jobs"
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={(e) => handleFileImport(e, "jobs")}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="import-reviews" className="text-sm">
                    Import Đánh giá
                  </Label>
                  <div className="mt-2">
                    <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted transition-colors">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm">Chon file CSV</span>
                      <input
                        id="import-reviews"
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={(e) => handleFileImport(e, "reviews")}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="import-users" className="text-sm">
                    Import Người dùng
                  </Label>
                  <div className="mt-2">
                    <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted transition-colors">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm">Chon file CSV</span>
                      <input
                        id="import-users"
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={(e) => handleFileImport(e, "users")}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Export Section */}
            <div className="border-t pt-6">
              <Label className="text-base font-medium">Export dữ liệu CSV</Label>
              <p className="text-sm text-muted-foreground mb-4">Tải xuống dữ liệu dưới dạng file CSV</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => handleExport("jobs")}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Việc làm
                </Button>
                <Button variant="outline" onClick={() => handleExport("reviews")}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Đánh giá
                </Button>
                <Button variant="outline" onClick={() => handleExport("users")}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Người dùng
                </Button>
              </div>
            </div>

            {/* MongoDB Info */}
            <div className="border-t pt-6">
              <Label className="text-base font-medium">Kết nối MongoDB</Label>
              <p className="text-sm text-muted-foreground mb-4">Thông tin kết nối cơ sở dữ liệu MongoDB</p>
              <div className="bg-muted p-4 rounded-lg space-y-2 font-mono text-sm">
                <p>
                  <span className="text-muted-foreground">URI:</span> mongodb://localhost:27017/gdu_career
                </p>
                <p>
                  <span className="text-muted-foreground">Database:</span> gdu_career
                </p>
                <p>
                  <span className="text-muted-foreground">Status:</span>{" "}
                  <span className="text-green-600">Connected</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

