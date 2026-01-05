"use client"
import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { expenseApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, CheckCircle, XCircle, Pause, Play, Loader2, TrendingUp, DollarSign } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Expense {
  _id: string
  name: string
  category: string
  amount: number
  type: "one_time" | "recursive"
  priority: "high" | "medium" | "low"
  due_date: string
  paid_date?: string
  description?: string
  payment_method?: string
  status: "active" | "paid" | "pending" | "overdue" | "stopped"
  frequency?: "days" | "month" | "quarter" | "half" | "year"
  frequency_value?: number
  is_active?: boolean
  parent_id?: { name: string }
  created_by: { name: string; email: string }
}

interface ExpenseStats {
  totalExpenses: number
  paidExpenses: number
  pendingExpenses: number
  overdueExpenses: number
  categoryBreakdown: Record<string, number>
  priorityBreakdown: Record<string, number>
  typeBreakdown: Record<string, number>
  expenseCount: number
}

export default function ExpensesPage() {
  const { token } = useAuth()
  const { toast } = useToast()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [stats, setStats] = useState<ExpenseStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    category: "all",
    status: "all",
    type: "all",
    priority: "all",
    startDate: "",
    endDate: "",
  })
  const [showForm, setShowForm] = useState(false)
  const [showPaidDialog, setShowPaidDialog] = useState(false)
  const [expenseToPay, setExpenseToPay] = useState<Expense | null>(null)
  const [paymentMethod, setPaymentMethod] = useState("")
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    amount: "",
    type: "one_time" as "one_time" | "recursive",
    priority: "medium" as "high" | "medium" | "low",
    due_date: new Date().toISOString().split("T")[0],
    description: "",
    payment_method: "",
    frequency: "month" as "days" | "month" | "quarter" | "half" | "year",
    frequency_value: "",
  })

  const fetchExpenses = async () => {
    if (!token) return
    try {
      setIsLoading(true)
      const data = await expenseApi.getExpenses({ ...filters, page: String(page), limit: String(limit) }, token)
      setExpenses(data.expenses)
      setTotalPages(data.pagination.pages)
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to fetch expenses", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    if (!token) return
    try {
      const data = await expenseApi.getStatistics({ startDate: filters.startDate, endDate: filters.endDate }, token)
      setStats(data)
    } catch (error: any) {
      console.error("Failed to fetch stats:", error)
    }
  }

  useEffect(() => {
    fetchExpenses()
    fetchStats()
  }, [page, filters, token])

  const handleSubmit = async () => {
    if (!token) return
    if (!formData.name || !formData.category || !formData.amount || !formData.due_date) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" })
      return
    }

    if (formData.type === "recursive" && !formData.frequency) {
      toast({ title: "Error", description: "Frequency is required for recursive expenses", variant: "destructive" })
      return
    }

    if (formData.frequency === "days" && !formData.frequency_value) {
      toast({ title: "Error", description: "Frequency value is required for days frequency", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      const submitFormData = new FormData()
      submitFormData.append("name", formData.name)
      submitFormData.append("category", formData.category)
      submitFormData.append("amount", formData.amount)
      submitFormData.append("type", formData.type)
      submitFormData.append("priority", formData.priority)
      submitFormData.append("due_date", formData.due_date)
      if (formData.description) submitFormData.append("description", formData.description)
      if (formData.type === "recursive") {
        submitFormData.append("frequency", formData.frequency)
        if (formData.frequency === "days") {
          submitFormData.append("frequency_value", formData.frequency_value)
        }
      }

      if (editingExpense) {
        await expenseApi.updateExpense(editingExpense._id, submitFormData, token)
        toast({ title: "Success", description: "Expense updated successfully" })
      } else {
        await expenseApi.createExpense(submitFormData, token)
        toast({ title: "Success", description: "Expense created successfully" })
      }

      setShowForm(false)
      setEditingExpense(null)
      resetForm()
      fetchExpenses()
      fetchStats()
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save expense", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setFormData({
      name: expense.name,
      category: expense.category,
      amount: expense.amount.toString(),
      type: expense.type,
      priority: expense.priority,
      due_date: new Date(expense.due_date).toISOString().split("T")[0],
      description: expense.description || "",
      frequency: expense.frequency || "month",
      frequency_value: expense.frequency_value?.toString() || "",
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!token) return
    if (!confirm("Are you sure you want to delete this expense?")) return

    try {
      await expenseApi.deleteExpense(id, token)
      toast({ title: "Success", description: "Expense deleted successfully" })
      fetchExpenses()
      fetchStats()
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete expense", variant: "destructive" })
    }
  }

  const handleMarkAsPaid = (expense: Expense) => {
    setExpenseToPay(expense)
    setPaymentMethod("")
    setShowPaidDialog(true)
  }

  const confirmMarkAsPaid = async () => {
    if (!token || !expenseToPay) return
    if (!paymentMethod) {
      toast({ title: "Error", description: "Please select a payment method", variant: "destructive" })
      return
    }

    try {
      await expenseApi.markAsPaid(expenseToPay._id, new Date().toISOString(), paymentMethod, token)
      toast({ title: "Success", description: "Expense marked as paid" })
      setShowPaidDialog(false)
      setExpenseToPay(null)
      setPaymentMethod("")
      fetchExpenses()
      fetchStats()
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to mark as paid", variant: "destructive" })
    }
  }

  const handleToggleActive = async (id: string) => {
    if (!token) return
    try {
      await expenseApi.toggleActive(id, token)
      toast({ title: "Success", description: "Expense status updated" })
      fetchExpenses()
      fetchStats()
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update status", variant: "destructive" })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      amount: "",
      type: "one_time",
      priority: "medium",
      due_date: new Date().toISOString().split("T")[0],
      description: "",
      frequency: "month",
      frequency_value: "",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "active":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      case "stopped":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Expense Management</h1>
            <p className="text-muted-foreground">Track and manage all expenses</p>
          </div>
          <Button onClick={() => { setShowForm(true); setEditingExpense(null); resetForm() }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>

        {stats && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalExpenses.toLocaleString()} Frw</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paid</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.paidExpenses.toLocaleString()} Frw</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <TrendingUp className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingExpenses.toLocaleString()} Frw</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overdueExpenses.toLocaleString()} Frw</div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Filters</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({ category: "all", status: "all", type: "all", priority: "all", startDate: "", endDate: "" })}
              >
                Reset
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Select value={filters.category} onValueChange={(value) => { setFilters({ ...filters, category: value }); setPage(1) }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="salary">Salary</SelectItem>
                <SelectItem value="utilities">Utilities</SelectItem>
                <SelectItem value="supplies">Supplies</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="rent">Rent</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="travel">Travel</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.status} onValueChange={(value) => { setFilters({ ...filters, status: value }); setPage(1) }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="stopped">Stopped</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.type} onValueChange={(value) => { setFilters({ ...filters, type: value }); setPage(1) }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="one_time">One Time</SelectItem>
                <SelectItem value="recursive">Recursive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.priority} onValueChange={(value) => { setFilters({ ...filters, priority: value }); setPage(1) }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              placeholder="Start Date"
              value={filters.startDate}
              onChange={(e) => { setFilters({ ...filters, startDate: e.target.value }); setPage(1) }}
              className="w-[180px]"
            />
            <Input
              type="date"
              placeholder="End Date"
              value={filters.endDate}
              onChange={(e) => { setFilters({ ...filters, endDate: e.target.value }); setPage(1) }}
              className="w-[180px]"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expenses List</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 animate-pulse bg-muted rounded" />
                ))}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenses.map((expense) => (
                        <TableRow key={expense._id}>
                          <TableCell className="font-medium">{expense.name}</TableCell>
                          <TableCell className="capitalize">{expense.category}</TableCell>
                          <TableCell className="font-semibold">{expense.amount.toLocaleString()} Frw</TableCell>
                          <TableCell>
                            <Badge variant={expense.type === "recursive" ? "default" : "outline"}>
                              {expense.type === "recursive" ? "Recursive" : "One Time"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(expense.priority)}>{expense.priority}</Badge>
                          </TableCell>
                          <TableCell>{new Date(expense.due_date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(expense.status)}>{expense.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {expense.status !== "paid" && (
                                <Button size="sm" variant="outline" onClick={() => handleMarkAsPaid(expense)}>
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                              {expense.type === "recursive" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleToggleActive(expense._id)}
                                  title={expense.is_active ? "Stop" : "Activate"}
                                >
                                  {expense.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                </Button>
                              )}
                              <Button size="sm" variant="outline" onClick={() => handleEdit(expense)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDelete(expense._id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <Button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} variant="outline">
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    variant="outline"
                  >
                    Next
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Expense Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingExpense ? "Edit Expense" : "Add New Expense"}</DialogTitle>
              <DialogDescription>Enter the expense details below</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Expense name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salary">Salary</SelectItem>
                      <SelectItem value="utilities">Utilities</SelectItem>
                      <SelectItem value="supplies">Supplies</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="rent">Rent</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="travel">Travel</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Amount (Frw) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type *</Label>
                  <Select value={formData.type} onValueChange={(value: "one_time" | "recursive") => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one_time">One Time</SelectItem>
                      <SelectItem value="recursive">Recursive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority *</Label>
                  <Select value={formData.priority} onValueChange={(value: "high" | "medium" | "low") => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="due_date">Due Date *</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
              {formData.type === "recursive" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="frequency">Frequency *</Label>
                    <Select value={formData.frequency} onValueChange={(value: any) => setFormData({ ...formData, frequency: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="days">Days</SelectItem>
                        <SelectItem value="month">Month</SelectItem>
                        <SelectItem value="quarter">Quarter</SelectItem>
                        <SelectItem value="half">Half Year</SelectItem>
                        <SelectItem value="year">Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.frequency === "days" && (
                    <div>
                      <Label htmlFor="frequency_value">Every (days) *</Label>
                      <Input
                        id="frequency_value"
                        type="number"
                        value={formData.frequency_value}
                        onChange={(e) => setFormData({ ...formData, frequency_value: e.target.value })}
                        placeholder="e.g., 7"
                      />
                    </div>
                  )}
                </div>
              )}
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Enter expense description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowForm(false); setEditingExpense(null); resetForm() }}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingExpense ? "Update" : "Create"} Expense
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Mark as Paid Dialog */}
        <Dialog open={showPaidDialog} onOpenChange={setShowPaidDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mark Expense as Paid</DialogTitle>
              <DialogDescription>
                Select the payment method used for this expense: {expenseToPay?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="payment_method">Payment Method *</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowPaidDialog(false); setExpenseToPay(null); setPaymentMethod("") }}>
                Cancel
              </Button>
              <Button onClick={confirmMarkAsPaid} disabled={!paymentMethod}>
                Mark as Paid
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
