"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
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
import { useAuth } from "@/lib/auth-context"
import { adminApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Trash2, UserCheck, UserX, Mail, Phone, MapPin, Eye, Send } from "lucide-react"

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Manage Users</h1>
            <p className="text-muted-foreground">View and manage platform users</p>
          </div>
          <div className="flex gap-2">
            {selectedUsers.length > 0 && (
              <Button onClick={() => setEmailDialog({ ...emailDialog, open: true })}>
                <Send className="h-4 w-4 mr-2" />
                Send Email ({selectedUsers.length})
              </Button>
            )}
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
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

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-20 animate-pulse bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : users.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No users found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <Card key={user._id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <Checkbox
                        checked={selectedUsers.includes(user._id)}
                        onCheckedChange={() => toggleUserSelection(user._id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground text-lg">{user.name}</h3>
                          <Badge variant="outline" className="capitalize">
                            {user.role}
                          </Badge>
                          <Badge className={user.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {user.is_active ? "Active" : "Inactive"}
                          </Badge>
                          {user.intake_completed && (
                            <Badge className="bg-blue-100 text-blue-800">Profile Complete</Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {user.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {user.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {user.location}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewProfile(user)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View Profile
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusToggle(user)}
                        className={user.is_active ? "text-orange-600" : "text-green-600"}
                      >
                        {user.is_active ? (
                          <>
                            <UserX className="h-4 w-4 mr-1" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-4 w-4 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 bg-transparent"
                        onClick={() => setDeleteDialog({ open: true, user })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, user: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteDialog.user?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, user: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={emailDialog.open} onOpenChange={(open) => setEmailDialog({ ...emailDialog, open })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Email to {selectedUsers.length} User(s)</DialogTitle>
            <DialogDescription>Compose and send an email to the selected users</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Subject</label>
              <Input
                value={emailDialog.subject}
                onChange={(e) => setEmailDialog({ ...emailDialog, subject: e.target.value })}
                placeholder="Enter email subject"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea
                value={emailDialog.message}
                onChange={(e) => setEmailDialog({ ...emailDialog, message: e.target.value })}
                placeholder="Enter your message"
                rows={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialog({ open: false, subject: "", message: "" })}>
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={!emailDialog.subject || !emailDialog.message}
              className="bg-primary"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={profileDialog.open} onOpenChange={(open) => setProfileDialog({ open, user: null, intake: null })}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Profile: {profileDialog.user?.name}</DialogTitle>
            <DialogDescription>View complete user information and intake details</DialogDescription>
          </DialogHeader>
          {profileDialog.user && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Name</label>
                    <p className="font-medium">{profileDialog.user.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Email</label>
                    <p className="font-medium">{profileDialog.user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Phone</label>
                    <p className="font-medium">{profileDialog.user.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Location</label>
                    <p className="font-medium">{profileDialog.user.location}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Role</label>
                    <p className="font-medium capitalize">{profileDialog.user.role}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Status</label>
                    <p className="font-medium">{profileDialog.user.is_active ? "Active" : "Inactive"}</p>
                  </div>
                </div>
              </div>

              {profileDialog.intake && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Intake Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Full Name</label>
                      <p className="font-medium">{profileDialog.intake.full_name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Country</label>
                      <p className="font-medium">{profileDialog.intake.country}</p>
                    </div>
                    {profileDialog.intake.education_level && (
                      <div>
                        <label className="text-sm text-muted-foreground">Education Level</label>
                        <p className="font-medium">{profileDialog.intake.education_level}</p>
                      </div>
                    )}
                    {profileDialog.intake.funding_amount_requested && (
                      <div>
                        <label className="text-sm text-muted-foreground">Funding Requested</label>
                        <p className="font-medium">${profileDialog.intake.funding_amount_requested.toLocaleString()}</p>
                      </div>
                    )}
                    {profileDialog.intake.business_name && (
                      <div className="col-span-2">
                        <label className="text-sm text-muted-foreground">Business Name</label>
                        <p className="font-medium">{profileDialog.intake.business_name}</p>
                      </div>
                    )}
                    {profileDialog.intake.idea_description && (
                      <div className="col-span-2">
                        <label className="text-sm text-muted-foreground">Business Idea</label>
                        <p className="font-medium">{profileDialog.intake.idea_description}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setProfileDialog({ open: false, user: null, intake: null })}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
