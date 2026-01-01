"use client"
import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth-context"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Plus, Download, TrendingUp, DollarSign, Loader2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Expense {
  _id: string
  category: string
  amount: number
  date: string
  description: string
  payment_method: string
  status: "pending" | "approved" | "rejected"
  created_by: { name: string }
}

interface ExpenseStats {
  totalExpenses: number
  categoryBreakdown: Record<string, number>
  monthlyTrend: Record<string, number>
}


export default function ExpensesPage() {
  const { user, token } = useAuth()
  const { toast } = useToast()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [stats, setStats] = useState<ExpenseStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({ category: "all", status: "all", startDate: "", endDate: "" })
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    payment_method: "",
    receipt: null as File | null,
  })

  const fetchExpenses = async () => {
    if (!token) return
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        category: filters.category,
        status: filters.status,
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      })

      const data = await apiClient<{ expenses: Expense[]; pagination: { pages: number } }>(`/expenses?${params}`, { token })
      setExpenses(data.expenses)
      setTotalPages(data.pagination.pages)
    } catch (error) {
      console.error("Failed to fetch expenses:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    if (!token) return
    try {
      const data = await apiClient<ExpenseStats>(`/expenses/analytics/summary`, {
        token,
        method: "GET",
      })
      setStats(data)
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }

  useEffect(() => {
    fetchExpenses()
    fetchStats()
  }, [page, filters, token])

  const handleExportCSV = () => {
    const csv = [
      ["Date", "Category", "Amount", "Description", "Payment Method", "Status"],
      ...expenses.map((e) => [
        new Date(e.date).toLocaleDateString(),
        e.category,
        e.amount,
        e.description,
        e.payment_method,
        e.status,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `expenses-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  const handleAddExpense = async () => {
    if (!token) return
    if (!formData.category || !formData.amount || !formData.date || !formData.description || !formData.payment_method) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      const submitFormData = new FormData()
      submitFormData.append("category", formData.category)
      submitFormData.append("amount", formData.amount)
      submitFormData.append("date", formData.date)
      submitFormData.append("description", formData.description)
      submitFormData.append("payment_method", formData.payment_method)
      if (formData.receipt) {
        submitFormData.append("receipt", formData.receipt)
      }

      await apiClient("/expenses", {
        method: "POST",
        body: submitFormData,
        token,
        isFormData: true,
      })

      toast({ title: "Success", description: "Expense added successfully" })
      setShowAddForm(false)
      setFormData({
        category: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        description: "",
        payment_method: "",
        receipt: null,
      })
      fetchExpenses()
      fetchStats()
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to add expense", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Expense Management</h1>
            <p className="text-muted-foreground">Track and manage business expenses</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExportCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </div>

        {stats && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalExpenses.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Expense</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(stats.totalExpenses / expenses.length || 0).toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expense Count</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{expenses.length}</div>
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
                onClick={() => setFilters({ category: "all", status: "all", startDate: "", endDate: "" })}
              >
                Reset
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <select
              className="px-3 py-2 border rounded-md text-sm"
              value={filters.category}
              onChange={(e) => {
                setFilters({ ...filters, category: e.target.value })
                setPage(1)
              }}
            >
              <option value="all">All Categories</option>
              <option value="salary">Salary</option>
              <option value="utilities">Utilities</option>
              <option value="supplies">Supplies</option>
              <option value="marketing">Marketing</option>
              <option value="rent">Rent</option>
              <option value="equipment">Equipment</option>
              <option value="travel">Travel</option>
              <option value="other">Other</option>
            </select>
            <select
              className="px-3 py-2 border rounded-md text-sm"
              value={filters.status}
              onChange={(e) => {
                setFilters({ ...filters, status: e.target.value })
                setPage(1)
              }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <Input
              type="date"
              placeholder="Start Date"
              value={filters.startDate}
              onChange={(e) => {
                setFilters({ ...filters, startDate: e.target.value })
                setPage(1)
              }}
            />
            <Input
              type="date"
              placeholder="End Date"
              value={filters.endDate}
              onChange={(e) => {
                setFilters({ ...filters, endDate: e.target.value })
                setPage(1)
              }}
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
                        <TableHead>Date</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created By</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenses.map((expense) => (
                        <TableRow key={expense._id}>
                          <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                          <TableCell className="capitalize">{expense.category}</TableCell>
                          <TableCell className="font-semibold">${expense.amount.toLocaleString()}</TableCell>
                          <TableCell className="max-w-xs truncate">{expense.description}</TableCell>
                          <TableCell className="capitalize">{expense.payment_method.replace("_", " ")}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                expense.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : expense.status === "rejected"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {expense.status}
                            </span>
                          </TableCell>
                          <TableCell>{expense.created_by.name}</TableCell>
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

        {/* Add Expense Dialog */}
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
              <DialogDescription>Enter the expense details below</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Select category</option>
                  <option value="salary">Salary</option>
                  <option value="utilities">Utilities</option>
                  <option value="supplies">Supplies</option>
                  <option value="marketing">Marketing</option>
                  <option value="rent">Rent</option>
                  <option value="equipment">Equipment</option>
                  <option value="travel">Travel</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label htmlFor="amount">Amount (RWF) *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Enter expense description"
                />
              </div>
              <div>
                <Label htmlFor="payment_method">Payment Method *</Label>
                <select
                  id="payment_method"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                >
                  <option value="">Select payment method</option>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="check">Check</option>
                </select>
              </div>
              <div>
                <Label htmlFor="receipt">Receipt (Optional)</Label>
                <Input
                  id="receipt"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setFormData({ ...formData, receipt: e.target.files?.[0] || null })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddExpense} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Expense
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
