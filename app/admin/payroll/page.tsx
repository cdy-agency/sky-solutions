"use client"
import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { expenseApi, apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, DollarSign, TrendingUp, AlertCircle, Loader2, Calendar } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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
  is_active?: boolean
  parent_id?: { name: string }
  created_by: { name: string; email: string }
}

interface PayrollStats {
  totalAmount: number
  paidAmount: number
  pendingAmount: number
  overdueAmount: number
  categoryBreakdown: Record<string, number>
  priorityBreakdown: Record<string, number>
  typeBreakdown: Record<string, number>
  expenseCount: number
}

export default function PayrollPage() {
  const { token } = useAuth()
  const { toast } = useToast()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [stats, setStats] = useState<PayrollStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({ status: "all", priority: "all", category: "all" })
  const [activeTab, setActiveTab] = useState<"expenses" | "statistics">("expenses")
  const [showPaidDialog, setShowPaidDialog] = useState(false)
  const [expenseToPay, setExpenseToPay] = useState<Expense | null>(null)
  const [paymentMethod, setPaymentMethod] = useState("")

  const fetchExpenses = async () => {
    if (!token) return
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(filters.status !== "all" && { status: filters.status }),
        ...(filters.priority !== "all" && { priority: filters.priority }),
        ...(filters.category !== "all" && { category: filters.category }),
      })

      const data = await expenseApi.getActiveExpenses(token)
      // Filter client-side for now since backend returns all active
      let filtered = data
      if (filters.status !== "all") {
        filtered = filtered.filter((e: Expense) => e.status === filters.status)
      }
      if (filters.priority !== "all") {
        filtered = filtered.filter((e: Expense) => e.priority === filters.priority)
      }
      if (filters.category !== "all") {
        filtered = filtered.filter((e: Expense) => e.category === filters.category)
      }

      const start = (page - 1) * limit
      const end = start + limit
      setExpenses(filtered.slice(start, end))
      setTotalPages(Math.ceil(filtered.length / limit))
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to fetch expenses", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    if (!token) return
    try {
      const data = await apiClient<PayrollStats>(`/payroll/statistics`, { token, method: "GET" })
      setStats(data)
    } catch (error: any) {
      console.error("Failed to fetch stats:", error)
    }
  }

  useEffect(() => {
    fetchExpenses()
    fetchStats()
  }, [page, filters, token])

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
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payroll & Active Expenses</h1>
          <p className="text-muted-foreground">Manage active expenses and mark them as paid</p>
        </div>

        {stats && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Active</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAmount.toLocaleString()} Frw</div>
                <p className="text-xs text-muted-foreground mt-1">{stats.expenseCount} expenses</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paid</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.paidAmount.toLocaleString()} Frw</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <TrendingUp className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingAmount.toLocaleString()} Frw</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overdueAmount.toLocaleString()} Frw</div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "expenses" | "statistics")}>
          <TabsList>
            <TabsTrigger value="expenses">Active Expenses</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Filters</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilters({ status: "all", priority: "all", category: "all" })}
                  >
                    Reset
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <Select value={filters.status} onValueChange={(value) => { setFilters({ ...filters, status: value }); setPage(1) }}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Expenses</CardTitle>
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
                                <Badge className={getPriorityColor(expense.priority)}>{expense.priority}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  {new Date(expense.due_date).toLocaleDateString()}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(expense.status)}>{expense.status}</Badge>
                              </TableCell>
                              <TableCell>
                                {expense.status !== "paid" && (
                                  <Button size="sm" variant="outline" onClick={() => handleMarkAsPaid(expense)}>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Mark Paid
                                  </Button>
                                )}
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
          </TabsContent>

          <TabsContent value="statistics" className="space-y-4">
            {stats && (
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Category Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(stats.categoryBreakdown).map(([category, amount]) => (
                        <div key={category} className="flex justify-between items-center">
                          <span className="capitalize">{category}</span>
                          <span className="font-semibold">{amount.toLocaleString()} Frw</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Priority Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(stats.priorityBreakdown).map(([priority, amount]) => (
                        <div key={priority} className="flex justify-between items-center">
                          <Badge className={getPriorityColor(priority)}>{priority}</Badge>
                          <span className="font-semibold">{amount.toLocaleString()} Frw</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Type Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(stats.typeBreakdown).map(([type, amount]) => (
                        <div key={type} className="flex justify-between items-center">
                          <span className="capitalize">{type === "one_time" ? "One Time" : "Recursive"}</span>
                          <span className="font-semibold">{amount.toLocaleString()} Frw</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>

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
