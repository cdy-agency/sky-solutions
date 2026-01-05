"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { adminApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, Bold, Italic, Underline, List, Link as LinkIcon, AlignLeft, AlignCenter, AlignRight } from "lucide-react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Color from "@tiptap/extension-color"
import TextAlign from "@tiptap/extension-text-align"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import UnderlineExtension from "@tiptap/extension-underline"

interface Terms {
  _id: string
  general: string
  entrepreneur: string
  investor: string
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null
  }

  return (
    <div className="border-b border-border p-2 flex flex-wrap gap-2">
      <Button
        type="button"
        variant={editor.isActive("bold") ? "default" : "outline"}
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={editor.isActive("italic") ? "default" : "outline"}
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={editor.isActive("underline") ? "default" : "outline"}
        size="sm"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <Underline className="h-4 w-4" />
      </Button>
      <div className="w-px bg-border mx-1" />
      <Button
        type="button"
        variant={editor.isActive("heading", { level: 1 }) ? "default" : "outline"}
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        H1
      </Button>
      <Button
        type="button"
        variant={editor.isActive("heading", { level: 2 }) ? "default" : "outline"}
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </Button>
      <Button
        type="button"
        variant={editor.isActive("heading", { level: 3 }) ? "default" : "outline"}
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        H3
      </Button>
      <div className="w-px bg-border mx-1" />
      <Button
        type="button"
        variant={editor.isActive("bulletList") ? "default" : "outline"}
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={editor.isActive("orderedList") ? "default" : "outline"}
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <List className="h-4 w-4" />
      </Button>
      <div className="w-px bg-border mx-1" />
      <Button
        type="button"
        variant={editor.isActive({ textAlign: "left" }) ? "default" : "outline"}
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={editor.isActive({ textAlign: "center" }) ? "default" : "outline"}
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={editor.isActive({ textAlign: "right" }) ? "default" : "outline"}
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        <AlignRight className="h-4 w-4" />
      </Button>
      <div className="w-px bg-border mx-1" />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          const url = window.prompt("Enter URL:")
          if (url) {
            editor.chain().focus().setLink({ href: url }).run()
          }
        }}
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => editor.chain().focus().unsetLink().run()}
        disabled={!editor.isActive("link")}
      >
        Unlink
      </Button>
    </div>
  )
}

export default function AdminTermsPage() {
  const { token } = useAuth()
  const { toast } = useToast()
  const [terms, setTerms] = useState<Terms | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    general: "",
    entrepreneur: "",
    investor: "",
  })

  const generalEditor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExtension,
      Color,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
    ],
    content: formData.general,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setFormData((prev) => ({ ...prev, general: editor.getHTML() }))
    },
  })

  const entrepreneurEditor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExtension,
      Color,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
    ],
    content: formData.entrepreneur,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setFormData((prev) => ({ ...prev, entrepreneur: editor.getHTML() }))
    },
  })

  const investorEditor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExtension,
      Color,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
    ],
    content: formData.investor,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setFormData((prev) => ({ ...prev, investor: editor.getHTML() }))
    },
  })

  useEffect(() => {
    const fetchTerms = async () => {
      if (!token) return
      try {
        const data = await adminApi.getTerms(token)
        setTerms(data)
        const general = data.general || ""
        const entrepreneur = data.entrepreneur || ""
        const investor = data.investor || ""
        setFormData({
          general,
          entrepreneur,
          investor,
        })
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load terms",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchTerms()
  }, [token, toast])

  // Update editors when terms are loaded
  useEffect(() => {
    if (generalEditor && terms) {
      const general = terms.general || ""
      const currentContent = generalEditor.getHTML()
      if (currentContent !== general && currentContent === "<p></p>") {
        generalEditor.commands.setContent(general)
      }
    }
  }, [terms, generalEditor])

  useEffect(() => {
    if (entrepreneurEditor && terms) {
      const entrepreneur = terms.entrepreneur || ""
      const currentContent = entrepreneurEditor.getHTML()
      if (currentContent !== entrepreneur && currentContent === "<p></p>") {
        entrepreneurEditor.commands.setContent(entrepreneur)
      }
    }
  }, [terms, entrepreneurEditor])

  useEffect(() => {
    if (investorEditor && terms) {
      const investor = terms.investor || ""
      const currentContent = investorEditor.getHTML()
      if (currentContent !== investor && currentContent === "<p></p>") {
        investorEditor.commands.setContent(investor)
      }
    }
  }, [terms, investorEditor])

  const handleSave = async () => {
    if (!token) return
    setIsSaving(true)
    try {
      const updated = await adminApi.updateTerms(formData, token)
      setTerms(updated)
      toast({
        title: "Success",
        description: "Terms and policy updated successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update terms",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Terms & Policy</h1>
            <p className="text-muted-foreground">Manage terms and conditions for different user types</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Terms & Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="entrepreneur">Entrepreneur</TabsTrigger>
                <TabsTrigger value="investor">Investor</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="mt-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">General Terms & Conditions</label>
                  <div className="border rounded-lg overflow-hidden">
                    <MenuBar editor={generalEditor} />
                    <div className="min-h-[400px] p-4 bg-background">
                      <EditorContent editor={generalEditor} />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="entrepreneur" className="mt-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Entrepreneur Terms & Conditions</label>
                  <div className="border rounded-lg overflow-hidden">
                    <MenuBar editor={entrepreneurEditor} />
                    <div className="min-h-[400px] p-4 bg-background">
                      <EditorContent editor={entrepreneurEditor} />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="investor" className="mt-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Investor Terms & Conditions</label>
                  <div className="border rounded-lg overflow-hidden">
                    <MenuBar editor={investorEditor} />
                    <div className="min-h-[400px] p-4 bg-background">
                      <EditorContent editor={investorEditor} />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
