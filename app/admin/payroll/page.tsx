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
import { apiClient, adminApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Plus, DollarSign, Clock, CheckCircle, Loader2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Payroll {
  _id: string
  employee_id: { name: string; email: string; position: string }
  period_start: string
  period_end: string
  salary: number
  deductions: number
  taxes: number
  net_amount: number
  status: "draft" | "processed" | "paid"
}

interface Invoice {
  _id: string
  vendor_name: string
  amount: number
  category: string
  due_date: string
  status: "pending" | "paid" | "overdue"
}

interface Employee {
  _id: string
  name: string
  email: string
  position: string
}

export default function PayrollPage() {
  const { user, token } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<"payroll" | "invoices">("payroll")
  const [payrolls, setPayrolls] = useState<Payroll[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({ status: "all" })
  const [showPayrollForm, setShowPayrollForm] = useState(false)
  const [showInvoiceForm, setShowInvoiceForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [payrollFormData, setPayrollFormData] = useState({
    employee_id: "",
    period_start: new Date().toISOString().split("T")[0],
    period_end: new Date().toISOString().split("T")[0],
    salary: "",
    deductions: "0",
    taxes: "0",
    notes: "",
  })
  const [invoiceFormData, setInvoiceFormData] = useState({
    vendor_name: "",
    amount: "",
    currency: "RWF",
    due_date: new Date().toISOString().split("T")[0],
    category: "",
    description: "",
    recurring: false,
    frequency: "",
    notes: "",
  })

  const fetchEmployees = async () => {
    if (!token) return
    try {
      const data = await apiClient<{ employees: Employee[] }>("/employees?limit=1000", { token })
      setEmployees(data.employees || [])
    } catch (error) {
      console.error("Failed to fetch employees:", error)
      toast({ title: "Error", description: "Failed to load employees", variant: "destructive" })
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [token])


  const fetchPayrolls = async () => {
    if (!token) return
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        status: filters.status,
      })

      const data = await apiClient<{ payrolls: Payroll[]; pagination: { total: number; pages: number } }>(`/payroll?${params}`, { token })
      setPayrolls(data.payrolls)
      setTotalPages(data.pagination.pages)
    } catch (error) {
      console.error("Failed to fetch payrolls:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchInvoices = async () => {
    if (!token) return
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        status: filters.status,
      })

      const data = await apiClient<{ invoices: Invoice[]; pagination: { total: number; pages: number } }>(`/payroll/invoices?${params}`, { token })
      setInvoices(data.invoices)
      setTotalPages(data.pagination.pages)
    } catch (error) {
      console.error("Failed to fetch invoices:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === "payroll") fetchPayrolls()
    else fetchInvoices()
  }, [page, filters, token, activeTab])

  const totalPayroll = payrolls.reduce((sum, p) => sum + p.net_amount, 0)
  const paidPayroll = payrolls.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.net_amount, 0)
  const pendingInvoices = invoices.filter((i) => i.status === "pending").length

  const handleGeneratePayroll = async () => {
    if (!token) return
    if (!payrollFormData.employee_id || !payrollFormData.period_start || !payrollFormData.period_end || !payrollFormData.salary) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      await apiClient("/payroll", {
        method: "POST",
        body: {
          employee_id: payrollFormData.employee_id,
          period_start: payrollFormData.period_start,
          period_end: payrollFormData.period_end,
          salary: payrollFormData.salary,
          deductions: payrollFormData.deductions,
          taxes: payrollFormData.taxes,
          notes: payrollFormData.notes,
        },
        token,
      })

      toast({ title: "Success", description: "Payroll generated successfully" })
      setShowPayrollForm(false)
      setPayrollFormData({
        employee_id: "",
        period_start: new Date().toISOString().split("T")[0],
        period_end: new Date().toISOString().split("T")[0],
        salary: "",
        deductions: "0",
        taxes: "0",
        notes: "",
      })
      fetchPayrolls()
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to generate payroll", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddInvoice = async () => {
    if (!token) return
    if (!invoiceFormData.vendor_name || !invoiceFormData.amount || !invoiceFormData.due_date || !invoiceFormData.category || !invoiceFormData.description) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      await apiClient("/payroll/invoices", {
        method: "POST",
        body: {
          vendor_name: invoiceFormData.vendor_name,
          amount: invoiceFormData.amount,
          currency: invoiceFormData.currency,
          due_date: invoiceFormData.due_date,
          category: invoiceFormData.category,
          description: invoiceFormData.description,
          recurring: invoiceFormData.recurring,
          frequency: invoiceFormData.frequency,
          notes: invoiceFormData.notes,
        },
        token,
      })

      toast({ title: "Success", description: "Invoice added successfully" })
      setShowInvoiceForm(false)
      setInvoiceFormData({
        vendor_name: "",
        amount: "",
        currency: "RWF",
        due_date: new Date().toISOString().split("T")[0],
        category: "",
        description: "",
        recurring: false,
        frequency: "",
        notes: "",
      })
      fetchInvoices()
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to add invoice", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Payroll & Invoices</h1>
            <p className="text-muted-foreground">Manage payroll and vendor invoices</p>
          </div>
          <Button onClick={() => activeTab === "payroll" ? setShowPayrollForm(true) : setShowInvoiceForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {activeTab === "payroll" ? "Generate Payslip" : "Add Invoice"}
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {activeTab === "payroll" ? (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalPayroll.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Paid</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${paidPayroll.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${(totalPayroll - paidPayroll).toLocaleString()}</div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${invoices.reduce((sum, i) => sum + i.amount, 0).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingInvoices}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{invoices.filter((i) => i.status === "overdue").length}</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="flex gap-2 border-b">
          <Button variant={activeTab === "payroll" ? "default" : "ghost"} onClick={() => setActiveTab("payroll")}>
            Payroll
          </Button>
          <Button variant={activeTab === "invoices" ? "default" : "ghost"} onClick={() => setActiveTab("invoices")}>
            Invoices
          </Button>
        </div>

        <Card>
          <CardHeader>
            <select
              className="px-3 py-2 border rounded-md text-sm"
              value={filters.status}
              onChange={(e) => {
                setFilters({ ...filters, status: e.target.value })
                setPage(1)
              }}
            >
              <option value="all">All Status</option>
              {activeTab === "payroll" ? (
                <>
                  <option value="draft">Draft</option>
                  <option value="processed">Processed</option>
                  <option value="paid">Paid</option>
                </>
              ) : (
                <>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </>
              )}
            </select>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{activeTab === "payroll" ? "Payroll List" : "Invoice List"}</CardTitle>
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
                        {activeTab === "payroll" ? (
                          <>
                            <TableHead>Employee</TableHead>
                            <TableHead>Period</TableHead>
                            <TableHead>Salary</TableHead>
                            <TableHead>Deductions</TableHead>
                            <TableHead>Taxes</TableHead>
                            <TableHead>Net Amount</TableHead>
                            <TableHead>Status</TableHead>
                          </>
                        ) : (
                          <>
                            <TableHead>Vendor</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(activeTab === "payroll" ? payrolls : invoices).map((item: any) => (
                        <TableRow key={item._id}>
                          {activeTab === "payroll" ? (
                            <>
                              <TableCell className="font-semibold">{item.employee_id.name}</TableCell>
                              <TableCell>
                                {new Date(item.period_start).toLocaleDateString()} -{" "}
                                {new Date(item.period_end).toLocaleDateString()}
                              </TableCell>
                              <TableCell>${item.salary.toLocaleString()}</TableCell>
                              <TableCell>${item.deductions.toLocaleString()}</TableCell>
                              <TableCell>${item.taxes.toLocaleString()}</TableCell>
                              <TableCell className="font-semibold">${item.net_amount.toLocaleString()}</TableCell>
                              <TableCell>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    item.status === "paid"
                                      ? "bg-green-100 text-green-800"
                                      : item.status === "processed"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell className="font-semibold">{item.vendor_name}</TableCell>
                              <TableCell className="font-semibold">${item.amount.toLocaleString()}</TableCell>
                              <TableCell className="capitalize">{item.category}</TableCell>
                              <TableCell>{new Date(item.due_date).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    item.status === "paid"
                                      ? "bg-green-100 text-green-800"
                                      : item.status === "overdue"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm">
                                  Edit
                                </Button>
                              </TableCell>
                            </>
                          )}
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

        {/* Generate Payroll Dialog */}
        <Dialog open={showPayrollForm} onOpenChange={setShowPayrollForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Generate Payslip</DialogTitle>
              <DialogDescription>Create a new payroll entry for an employee</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                  <Label htmlFor="payroll-employee">Employee *</Label>
                <select
                  id="payroll-employee"
                  className="w-full px-3 py-2 border rounded-md"
                  value={payrollFormData.employee_id}
                  onChange={(e) => setPayrollFormData({ ...payrollFormData, employee_id: e.target.value })}
                >
                  <option value="">Select employee</option>
                  {employees.map((employee) => (
                    <option key={employee._id} value={employee._id}>
                      {employee.name} - {employee.position}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                  <Label htmlFor="payroll-period-start">Period Start *</Label>
                  <Input
                    id="payroll-period-start"
                    type="date"
                    value={payrollFormData.period_start}
                    onChange={(e) => setPayrollFormData({ ...payrollFormData, period_start: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="payroll-period-end">Period End *</Label>
                  <Input
                    id="payroll-period-end"
                    type="date"
                    value={payrollFormData.period_end}
                    onChange={(e) => setPayrollFormData({ ...payrollFormData, period_end: e.target.value })}
                  />
                  </div>
                </div>  
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="salary">Salary *</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={payrollFormData.salary}
                    onChange={(e) => setPayrollFormData({ ...payrollFormData, salary: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="deductions">Deductions</Label>
                  <Input
                    id="deductions"
                    type="number"
                    value={payrollFormData.deductions}
                    onChange={(e) => setPayrollFormData({ ...payrollFormData, deductions: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="taxes">Taxes</Label>
                  <Input
                    id="taxes"
                    type="number"
                    value={payrollFormData.taxes}
                    onChange={(e) => setPayrollFormData({ ...payrollFormData, taxes: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="payroll-notes">Notes</Label>
                <Textarea
                  id="payroll-notes"
                  value={payrollFormData.notes}
                  onChange={(e) => setPayrollFormData({ ...payrollFormData, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPayrollForm(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleGeneratePayroll} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Payslip
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Invoice Dialog */}
        <Dialog open={showInvoiceForm} onOpenChange={setShowInvoiceForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Invoice</DialogTitle>
              <DialogDescription>Add a new vendor invoice</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="invoice-vendor-name">Vendor Name *</Label>
                <Input
                  id="invoice-vendor-name"
                  value={invoiceFormData.vendor_name}
                  onChange={(e) => setInvoiceFormData({ ...invoiceFormData, vendor_name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoice-amount">Amount *</Label>
                  <Input
                    id="invoice-amount"
                    type="number"
                    value={invoiceFormData.amount}
                    onChange={(e) => setInvoiceFormData({ ...invoiceFormData, amount: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoice-category">Category *</Label>
                  <Input
                    id="invoice-category"
                    value={invoiceFormData.category}
                    onChange={(e) => setInvoiceFormData({ ...invoiceFormData, category: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="invoice-due-date">Due Date *</Label>
                  <Input
                    id="invoice-due-date"
                    type="date"
                    value={invoiceFormData.due_date}
                    onChange={(e) => setInvoiceFormData({ ...invoiceFormData, due_date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="invoice-description">Description *</Label>
                <Textarea
                  id="invoice-description"
                  value={invoiceFormData.description}
                  onChange={(e) => setInvoiceFormData({ ...invoiceFormData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={invoiceFormData.recurring}
                    onChange={(e) => setInvoiceFormData({ ...invoiceFormData, recurring: e.target.checked })}
                  />
                  <span>Recurring Invoice</span>
                </label>
                {invoiceFormData.recurring && (
                  <select
                    className="px-3 py-2 border rounded-md"
                    value={invoiceFormData.frequency}
                    onChange={(e) => setInvoiceFormData({ ...invoiceFormData, frequency: e.target.value })}
                  >
                    <option value="">Select frequency</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                )}
              </div>
              <div>
                <Label htmlFor="invoice-notes">Notes</Label>
                <Textarea
                  id="invoice-notes"
                  value={invoiceFormData.notes}
                  onChange={(e) => setInvoiceFormData({ ...invoiceFormData, notes: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowInvoiceForm(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleAddInvoice} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Invoice
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
