"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Plus, Trash2, Edit, Loader2 } from "lucide-react"

interface Category {
  _id: string
  name: string
  fee: number
  created_at: string
}

export default function CategoriesPage() {
  const { token } = useAuth()
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dialog, setDialog] = useState<{
    open: boolean
    mode: "create" | "edit"
    category: Category | null
  }>({ open: false, mode: "create", category: null })
  const [formData, setFormData] = useState({ name: "", fee: "" })

  const fetchCategories = async () => {
    if (!token) return
    try {
      const data = await adminApi.getCategories(token)
      setCategories(data)
    } catch (error) {
      console.error("Failed to fetch categories:", error)
      toast({ title: "Error", description: "Failed to load categories", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [token])

  const handleOpenDialog = (mode: "create" | "edit", category?: Category) => {
    setDialog({ open: true, mode, category: category || null })
    if (category) {
      setFormData({ name: category.name, fee: category.fee.toString() })
    } else {
      setFormData({ name: "", fee: "" })
    }
  }

  const handleSubmit = async () => {
    if (!token || !formData.name || !formData.fee) {
      toast({ title: "Error", description: "Please fill all fields", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      const categoryData = { name: formData.name, registration_fee: Number(formData.fee) }

      if (dialog.mode === "create") {
        await adminApi.createCategory(categoryData, token)
        toast({ title: "Success", description: "Category created successfully" })
      } else if (dialog.category) {
        await adminApi.updateCategory(dialog.category._id, categoryData, token)
        toast({ title: "Success", description: "Category updated successfully" })
      }

      setDialog({ open: false, mode: "create", category: null })
      fetchCategories()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!token) return
    try {
      await adminApi.deleteCategory(id, token)
      toast({ title: "Success", description: "Category deleted successfully" })
      fetchCategories()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Business Categories</h1>
            <p className="text-muted-foreground">Manage business categories and registration fees</p>
          </div>
          <Button onClick={() => handleOpenDialog("create")}>
            <Plus className="h-4 w-4 mr-2" />
            New Category
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-12 animate-pulse bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No categories created yet</p>
              <Button onClick={() => handleOpenDialog("create")}>Create First Category</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {categories.map((category) => (
              <Card key={category._id}>
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">Registration Fee: ${category.fee}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenDialog("edit", category)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 bg-transparent"
                      onClick={() => handleDelete(category._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={dialog.open} onOpenChange={(open) => setDialog({ ...dialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialog.mode === "create" ? "Create Category" : "Edit Category"}</DialogTitle>
            <DialogDescription>
              {dialog.mode === "create"
                ? "Create a new business category with its registration fee"
                : "Update the category name and registration fee"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                placeholder="e.g., Technology"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fee">Registration Fee ($)</Label>
              <Input
                id="fee"
                type="number"
                placeholder="e.g., 1000"
                value={formData.fee}
                onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                min={0}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog({ open: false, mode: "create", category: null })}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {dialog.mode === "create" ? "Create" : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
