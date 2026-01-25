"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuth } from "@/lib/auth-context"
import { adminApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Trash2, UserCheck, UserX, Mail, Phone, MapPin, Eye, Send, Users, Filter, CheckCircle2, XCircle } from "lucide-react"
import { Separator } from "@/components/ui/separator"

interface User {
  _id: string
  name: string
  email: string
  phone: string
  location: string
  role: string
  is_active: boolean
  intake_completed: boolean
  created_at: string
}

export default function AdminUsersPage() {
  const { token } = useAuth()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null,
  })
  const [emailDialog, setEmailDialog] = useState({
    open: false,
    subject: "",
    message: "",
  })
  const [profileDialog, setProfileDialog] = useState<{ open: boolean; user: User | null; intake: any | null }>({
    open: false,
    user: null,
    intake: null,
  })

  const fetchUsers = async () => {
    if (!token) return
    try {
      const params = roleFilter !== "all" ? { role: roleFilter } : undefined
      const data = await adminApi.getUsers(token, params)
      setUsers(data)
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [token, roleFilter])

  const handleDelete = async () => {
    if (!token || !deleteDialog.user) return
    try {
      await adminApi.deleteUser(deleteDialog.user._id, token)
      toast({ title: "Success", description: "User deleted successfully" })
      setDeleteDialog({ open: false, user: null })
      fetchUsers()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const handleStatusToggle = async (user: User) => {
    if (!token) return
    try {
      await adminApi.updateUserStatus(user._id, !user.is_active, token)
      toast({
        title: "Success",
        description: `User ${!user.is_active ? "activated" : "deactivated"} successfully`,
      })
      fetchUsers()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const handleViewProfile = async (user: User) => {
    if (!token) return
    try {
      const data = await adminApi.getUserProfile(user._id, token)
      setProfileDialog({ open: true, user: data.user, intake: data.intake })
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const handleSendEmail = async () => {
    if (!token || selectedUsers.length === 0) return
    try {
      await adminApi.sendEmailToUsers(
        {
          user_ids: selectedUsers,
          subject: emailDialog.subject,
          message: emailDialog.message,
        },
        token,
      )
      toast({ title: "Success", description: `Email sent to ${selectedUsers.length} user(s)` })
      setEmailDialog({ open: false, subject: "", message: "" })
      setSelectedUsers([])
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const toggleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map((u) => u._id))
    }
  }

  const activeUsers = users.filter((u) => u.is_active).length
  const inactiveUsers = users.filter((u) => !u.is_active).length
  const entrepreneursCount = users.filter((u) => u.role === "entrepreneur").length
  const investorsCount = users.filter((u) => u.role === "investor").length

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-linear-to-r from-[#1B4F91] via-[#2563eb] to-[#3b82f6] bg-clip-text text-transparent">
                User Management
              </h1>
              <p className="text-muted-foreground mt-1">Manage and monitor platform users</p>
            </div>
            <div className="flex gap-2">
              {selectedUsers.length > 0 && (
                <Button 
                  onClick={() => setEmailDialog({ ...emailDialog, open: true })}
                  className="bg-linear-to-r from-[#1B4F91] to-[#2563eb] hover:from-[#1B4F91]/90 hover:to-[#2563eb]/90 shadow-md"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Email ({selectedUsers.length})
                </Button>
              )}
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-45">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="entrepreneur">Entrepreneurs</SelectItem>
                  <SelectItem value="investor">Investors</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-linear-to-br from-[#1B4F91] to-[#2563eb] flex items-center justify-center shadow-md">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  Users Directory
                </CardTitle>
                <CardDescription className="mt-1">
                  {selectedUsers.length > 0 ? `${selectedUsers.length} user(s) selected` : `${users.length} total users`}
                </CardDescription>
              </div>
              {selectedUsers.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedUsers([])}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Clear Selection
                </Button>
              )}
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse bg-linear-to-r from-muted to-muted/50 rounded" />
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-linear-to-br from-muted to-muted/50 flex items-center justify-center">
                  <Users className="h-10 w-10 text-muted-foreground/40" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No users found</h3>
                <p className="text-muted-foreground">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedUsers.length === users.length && users.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold">Contact</TableHead>
                      <TableHead className="font-semibold">Role</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Profile</TableHead>
                      <TableHead className="text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow 
                        key={user._id} 
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.includes(user._id)}
                            onCheckedChange={() => toggleUserSelection(user._id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#1B4F91] to-[#2563eb] flex items-center justify-center text-white font-semibold shadow-md">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{user.name}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {user.location}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm flex items-center gap-1.5 text-muted-foreground">
                              <Mail className="h-3.5 w-3.5" />
                              {user.email}
                            </p>
                            <p className="text-sm flex items-center gap-1.5 text-muted-foreground">
                              <Phone className="h-3.5 w-3.5" />
                              {user.phone}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`capitalize ${
                              user.role === 'entrepreneur' 
                                ? 'border-purple-200 bg-purple-50 text-purple-700' 
                                : 'border-amber-200 bg-amber-50 text-amber-700'
                            }`}
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              user.is_active 
                                ? "bg-green-100 text-green-800 hover:bg-green-100" 
                                : "bg-red-100 text-red-800 hover:bg-red-100"
                            }
                          >
                            {user.is_active ? (
                              <>
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Inactive
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.intake_completed ? (
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Complete
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleViewProfile(user)}
                              className="hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusToggle(user)}
                              className={
                                user.is_active 
                                  ? "hover:bg-orange-50 hover:text-orange-600" 
                                  : "hover:bg-green-50 hover:text-green-600"
                              }
                            >
                              {user.is_active ? (
                                <UserX className="h-4 w-4" />
                              ) : (
                                <UserCheck className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-red-50 hover:text-red-600"
                              onClick={() => setDeleteDialog({ open: true, user })}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, user: null })}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-red-500 to-red-600 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-white" />
              </div>
              Delete User
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              Are you sure you want to delete <span className="font-semibold text-foreground">"{deleteDialog.user?.name}"</span>? 
              This action cannot be undone and will permanently remove all user data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-4">
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, user: null })}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              className="bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={emailDialog.open} onOpenChange={(open) => setEmailDialog({ ...emailDialog, open })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-[#1B4F91] to-[#2563eb] flex items-center justify-center">
                <Send className="h-5 w-5 text-white" />
              </div>
              Send Email to {selectedUsers.length} User(s)
            </DialogTitle>
            <DialogDescription>Compose and send an email to the selected users</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject *</label>
              <Input
                value={emailDialog.subject}
                onChange={(e) => setEmailDialog({ ...emailDialog, subject: e.target.value })}
                placeholder="Enter email subject"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message *</label>
              <Textarea
                value={emailDialog.message}
                onChange={(e) => setEmailDialog({ ...emailDialog, message: e.target.value })}
                placeholder="Enter your message"
                rows={8}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEmailDialog({ open: false, subject: "", message: "" })}>
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={!emailDialog.subject || !emailDialog.message}
              className="bg-linear-to-r from-[#1B4F91] to-[#2563eb] hover:from-[#1B4F91]/90 hover:to-[#2563eb]/90"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profile Dialog */}
      <Dialog open={profileDialog.open} onOpenChange={(open) => setProfileDialog({ open, user: null, intake: null })}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-[#1B4F91] to-[#2563eb] flex items-center justify-center">
                <Eye className="h-5 w-5 text-white" />
              </div>
              User Profile: {profileDialog.user?.name}
            </DialogTitle>
            <DialogDescription>View complete user information and intake details</DialogDescription>
          </DialogHeader>
          {profileDialog.user && (
            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg">Basic Information</h3>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="font-medium text-base">{profileDialog.user.name}</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="font-medium text-base">{profileDialog.user.email}</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p className="font-medium text-base">{profileDialog.user.phone}</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">Location</label>
                    <p className="font-medium text-base">{profileDialog.user.location}</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">Role</label>
                    <Badge variant="outline" className="capitalize w-fit">
                      {profileDialog.user.role}
                    </Badge>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <Badge className={profileDialog.user.is_active ? "bg-green-100 text-green-800 w-fit" : "bg-red-100 text-red-800 w-fit"}>
                      {profileDialog.user.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Intake Information */}
              {profileDialog.intake && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg">Intake Information</h3>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                      <p className="font-medium text-base">{profileDialog.intake.full_name}</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-muted-foreground">Country</label>
                      <p className="font-medium text-base">{profileDialog.intake.country}</p>
                    </div>
                    {profileDialog.intake.education_level && (
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-muted-foreground">Education Level</label>
                        <p className="font-medium text-base">{profileDialog.intake.education_level}</p>
                      </div>
                    )}
                    {profileDialog.intake.funding_amount_requested && (
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-muted-foreground">Funding Requested</label>
                        <p className="font-medium text-base text-green-600">
                          ${profileDialog.intake.funding_amount_requested.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {profileDialog.intake.business_name && (
                      <div className="col-span-2 space-y-1.5">
                        <label className="text-sm font-medium text-muted-foreground">Business Name</label>
                        <p className="font-medium text-base">{profileDialog.intake.business_name}</p>
                      </div>
                    )}
                    {profileDialog.intake.idea_description && (
                      <div className="col-span-2 space-y-1.5">
                        <label className="text-sm font-medium text-muted-foreground">Business Idea</label>
                        <p className="font-medium text-base leading-relaxed">{profileDialog.intake.idea_description}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button 
              onClick={() => setProfileDialog({ open: false, user: null, intake: null })}
              className="bg-linear-to-r from-[#1B4F91] to-[#2563eb] hover:from-[#1B4F91]/90 hover:to-[#2563eb]/90"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}