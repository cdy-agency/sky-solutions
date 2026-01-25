"use client"

import React, { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth-context"
import { libraryApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Loader2, FolderPlus, Upload, Download, Trash2, File, Folder, Edit2, Move, MoreVertical, Eye, X, ChevronRight, Home, Search, Grid3x3, List } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface Folder {
  _id: string
  name: string
  description?: string
  created_at: string
}

interface Document {
  _id: string
  file_name: string
  file_type: string
  file_size: number
  file_url: string
  view_url?: string
  can_view_in_app?: boolean
  uploaded_by_id: { name: string }
  created_at: string
}

export default function AdminLibraryPage() {
  const { token } = useAuth()
  const { toast } = useToast()

  const [folders, setFolders] = useState<Folder[]>([])
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoadingFolders, setIsLoadingFolders] = useState(true)
  const [isLoadingDocs, setIsLoadingDocs] = useState(false)
  const [currentParentId, setCurrentParentId] = useState<string | null>(null)
  const [folderPath, setFolderPath] = useState<Folder[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")

  // Create folder state
  const [createFolderDialog, setCreateFolderDialog] = useState(false)
  const [folderName, setFolderName] = useState("")
  const [folderDescription, setFolderDescription] = useState("")
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)

  // Upload file state
  const [uploadDialog, setUploadDialog] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Sorting state
  const [sortBy, setSortBy] = useState<"name" | "date" | "size" | "type">("date")

  // Rename state
  const [renameDialog, setRenameDialog] = useState(false)
  const [renameType, setRenameType] = useState<"folder" | "document" | null>(null)
  const [renameId, setRenameId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const [isRenaming, setIsRenaming] = useState(false)

  // Move state
  const [moveDialog, setMoveDialog] = useState(false)
  const [moveType, setMoveType] = useState<"folder" | "document" | null>(null)
  const [moveId, setMoveId] = useState<string | null>(null)
  const [moveTargetFolder, setMoveTargetFolder] = useState<string | null>(null)
  const [allFolders, setAllFolders] = useState<Folder[]>([])
  const [isMoving, setIsMoving] = useState(false)

  // Delete folder state
  const [deleteFolderDialog, setDeleteFolderDialog] = useState(false)
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null)
  const [isDeletingFolder, setIsDeletingFolder] = useState(false)

  // View document state
  const [viewDialog, setViewDialog] = useState(false)
  const [viewingDocument, setViewingDocument] = useState<{ url: string; name: string; type: string } | null>(null)
  const [pdfLoadError, setPdfLoadError] = useState(false)

  const fetchFolders = async (parentId: string | null = null) => {
    if (!token) return
    try {
      const params = parentId ? `?parent_id=${parentId}` : "?parent_id=null"
      const data = await libraryApi.getFolders(token, params)
      setFolders(data)
      if (data.length > 0 && !selectedFolder) {
        setSelectedFolder(data[0])
        fetchDocuments(data[0]._id)
      }
    } catch (error) {
      console.error("Failed to fetch folders:", error)
      toast({ title: "Error", description: "Failed to load folders", variant: "destructive" })
    } finally {
      setIsLoadingFolders(false)
    }
  }

  useEffect(() => {
    fetchFolders(currentParentId)
  }, [token, currentParentId])

  const fetchDocuments = async (folderId: string) => {
    if (!token) return
    setIsLoadingDocs(true)
    try {
      const data = await libraryApi.getDocuments(folderId, token, 1, 100, sortBy)
      setDocuments(data.documents || [])
    } catch (error) {
      console.error("Failed to fetch documents:", error)
      toast({ title: "Error", description: "Failed to load documents", variant: "destructive" })
    } finally {
      setIsLoadingDocs(false)
    }
  }

  const fetchAllFolders = async () => {
    if (!token) return
    try {
      const data = await libraryApi.getFolders(token, "?sort=name")
      setAllFolders(data)
    } catch (error) {
      console.error("Failed to fetch all folders:", error)
    }
  }

  useEffect(() => {
    if (selectedFolder) {
      fetchDocuments(selectedFolder._id)
    }
  }, [sortBy, selectedFolder])

  useEffect(() => {
    fetchAllFolders()
  }, [token, folders])

  const handleCreateFolder = async () => {
    if (!folderName || !token) return
    setIsCreatingFolder(true)
    try {
      const newFolder = await libraryApi.createFolder(
        { name: folderName, description: folderDescription, parent_id: currentParentId || undefined },
        token,
      ) as Folder
      setFolders([...folders, newFolder])
      setCreateFolderDialog(false)
      setFolderName("")
      setFolderDescription("")
      toast({ title: "Success", description: "Folder created successfully" })
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setIsCreatingFolder(false)
    }
  }

  const handleFolderClick = (folder: Folder) => {
    setSelectedFolder(folder)
    fetchDocuments(folder._id)
  }

  const handleEnterFolder = (folder: Folder) => {
    setCurrentParentId(folder._id)
    setFolderPath([...folderPath, folder])
    setSelectedFolder(null)
  }

  const handleNavigateUp = () => {
    if (folderPath.length > 0) {
      const newPath = folderPath.slice(0, -1)
      setFolderPath(newPath)
      const newParent = newPath.length > 0 ? newPath[newPath.length - 1]._id : null
      setCurrentParentId(newParent)
      setSelectedFolder(null)
    } else {
      setCurrentParentId(null)
      setFolderPath([])
      setSelectedFolder(null)
    }
  }

  const handleUploadFile = async () => {
    if (!uploadFile || !selectedFolder || !token) return
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", uploadFile)
      formData.append("folder_id", selectedFolder._id)

      await libraryApi.uploadDocument(formData, token)
      toast({ title: "Success", description: "File uploaded successfully" })
      setUploadDialog(false)
      setUploadFile(null)
      fetchDocuments(selectedFolder._id)
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    if (!token || !selectedFolder) return
    if (!confirm("Are you sure you want to delete this document?")) return
    try {
      await libraryApi.deleteDocument(documentId, token)
      toast({ title: "Success", description: "Document deleted" })
      fetchDocuments(selectedFolder._id)
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const handleRename = (type: "folder" | "document", id: string, currentName: string) => {
    setRenameType(type)
    setRenameId(id)
    setRenameValue(currentName)
    setRenameDialog(true)
  }

  const handleRenameSubmit = async () => {
    if (!renameId || !renameValue || !token) return
    setIsRenaming(true)
    try {
      if (renameType === "folder") {
        await libraryApi.renameFolder(renameId, renameValue, token)
        toast({ title: "Success", description: "Folder renamed successfully" })
        fetchFolders(currentParentId)
        fetchAllFolders()
      } else {
        await libraryApi.renameDocument(renameId, renameValue, token)
        toast({ title: "Success", description: "Document renamed successfully" })
        if (selectedFolder) fetchDocuments(selectedFolder._id)
      }
      setRenameDialog(false)
      setRenameValue("")
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setIsRenaming(false)
    }
  }

  const handleMove = (type: "folder" | "document", id: string) => {
    setMoveType(type)
    setMoveId(id)
    setMoveTargetFolder(null)
    setMoveDialog(true)
    fetchAllFolders()
  }

  const handleMoveSubmit = async () => {
    if (!moveId || !token) return
    setIsMoving(true)
    try {
      if (moveType === "folder") {
        await libraryApi.moveFolder(moveId, moveTargetFolder, token)
        toast({ title: "Success", description: "Folder moved successfully" })
        fetchFolders(currentParentId)
        fetchAllFolders()
      } else {
        if (!moveTargetFolder) {
          toast({ title: "Error", description: "Please select a target folder", variant: "destructive" })
          return
        }
        await libraryApi.moveDocument(moveId, moveTargetFolder, token)
        toast({ title: "Success", description: "Document moved successfully" })
        if (selectedFolder) fetchDocuments(selectedFolder._id)
      }
      setMoveDialog(false)
      setMoveTargetFolder(null)
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setIsMoving(false)
    }
  }

  const handleDeleteFolder = async () => {
    if (!folderToDelete || !token) return
    setIsDeletingFolder(true)
    try {
      await libraryApi.deleteFolder(folderToDelete._id, token)
      toast({ title: "Success", description: "Folder deleted successfully" })
      setDeleteFolderDialog(false)
      setFolderToDelete(null)
      fetchFolders(currentParentId)
      fetchAllFolders()
      if (selectedFolder?._id === folderToDelete._id) {
        setSelectedFolder(null)
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setIsDeletingFolder(false)
    }
  }

  const handleDownload = async (documentId: string, fileName: string) => {
    if (!token) return
    try {
      const data = await libraryApi.downloadDocument(documentId, token)
      
      if (data.file_type === "application/pdf" || data.file_type.startsWith("image/")) {
        try {
          const response = await fetch(data.download_url, {
            method: "GET",
            headers: {
              Accept: data.file_type,
            },
          })
          
          if (!response.ok) throw new Error("Failed to fetch file")
          
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.download = data.file_name || fileName
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
        } catch (fetchError) {
          const link = document.createElement("a")
          link.href = data.download_url
          link.download = data.file_name || fileName
          link.target = "_blank"
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      } else {
        const link = document.createElement("a")
        link.href = data.download_url
        link.download = data.file_name || fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
      
      toast({ title: "Success", description: "File download started" })
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to download file", variant: "destructive" })
    }
  }

  const handleViewDocument = async (documentId: string, fileName: string, fileUrl: string, fileType: string) => {
    if (!token) return
    setPdfLoadError(false)
    try {
      const document = await libraryApi.getDocument(documentId, token)
      const viewUrl = (document as any).view_url || document.file_url || fileUrl
      
      setViewingDocument({
        url: viewUrl,
        name: fileName,
        type: fileType,
      })
      setViewDialog(true)
    } catch (error: any) {
      setViewingDocument({
        url: fileUrl,
        name: fileName,
        type: fileType,
      })
      setViewDialog(true)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return "🖼️"
    if (fileType === "application/pdf") return "📄"
    if (fileType.includes("word") || fileType.includes("document")) return "📝"
    if (fileType.includes("sheet") || fileType.includes("excel")) return "📊"
    if (fileType.includes("presentation") || fileType.includes("powerpoint")) return "📊"
    if (fileType.startsWith("text/")) return "📃"
    return "📎"
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-[#1B4F91] to-[#2563eb] bg-clip-text text-transparent">
              Document Library
            </h1>
            <p className="text-muted-foreground">Organize and manage your business documents efficiently</p>
          </div>
          <Button 
            onClick={() => setCreateFolderDialog(true)} 
            className="bg-linear-to-r from-[#1B4F91] to-[#2563eb] hover:from-[#1B4F91]/90 hover:to-[#2563eb]/90 shadow-lg"
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
        </div>

        {/* Breadcrumb Navigation */}
        {folderPath.length > 0 && (
          <Card className="border-l-4 border-l-[#1B4F91] shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm">
                <button
                  onClick={() => {
                    setCurrentParentId(null)
                    setFolderPath([])
                    setSelectedFolder(null)
                  }}
                  className="flex items-center gap-1 text-muted-foreground hover:text-[#1B4F91] transition-colors"
                >
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </button>
                {folderPath.map((folder, index) => (
                  <React.Fragment key={folder._id}>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <button
                      onClick={() => {
                        const newPath = folderPath.slice(0, index + 1)
                        setFolderPath(newPath)
                        setCurrentParentId(folder._id)
                        setSelectedFolder(null)
                      }}
                      className={`hover:text-[#1B4F91] transition-colors ${
                        index === folderPath.length - 1 ? "text-[#1B4F91] font-medium" : "text-muted-foreground"
                      }`}
                    >
                      {folder.name}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Folders Sidebar */}
          <div className="lg:col-span-1">
            <Card className="shadow-md border-t-4 border-t-[#1B4F91]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Folder className="h-5 w-5 text-[#1B4F91]" />
                  Folders
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4 space-y-1">
                {isLoadingFolders ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-10 bg-linear-to-r from-muted to-muted/50 rounded-md animate-pulse" />
                    ))}
                  </div>
                ) : folders.length === 0 ? (
                  <div className="text-center py-8">
                    <Folder className="h-12 w-12 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">No folders yet</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCreateFolderDialog(true)}
                      className="mt-2 text-[#1B4F91]"
                    >
                      Create your first folder
                    </Button>
                  </div>
                ) : (
                  <>
                    {folderPath.length > 0 && (
                      <button
                        onClick={handleNavigateUp}
                        className="w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all hover:bg-linear-to-r hover:from-muted hover:to-muted/50 text-foreground flex items-center gap-2 border border-transparent hover:border-border"
                      >
                        <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center">
                          <Folder className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="font-medium">.. (Back)</span>
                      </button>
                    )}
                    {folders.map((folder) => (
                      <div
                        key={folder._id}
                        className={`group rounded-lg transition-all ${
                          selectedFolder?._id === folder._id
                            ? "bg-linear-to-r from-[#1B4F91] to-[#2563eb] text-white shadow-md"
                            : "hover:bg-linear-to-r hover:from-muted hover:to-muted/50 text-foreground border border-transparent hover:border-border"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleFolderClick(folder)}
                            onDoubleClick={() => handleEnterFolder(folder)}
                            className="flex-1 text-left px-3 py-2.5 flex items-center gap-2"
                          >
                            <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                              selectedFolder?._id === folder._id 
                                ? "bg-white/20" 
                                : "bg-muted"
                            }`}>
                              <Folder className={`h-4 w-4 ${
                                selectedFolder?._id === folder._id 
                                  ? "text-white" 
                                  : "text-[#1B4F91]"
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate text-sm">{folder.name}</p>
                              {folder.description && (
                                <p className={`text-xs truncate ${
                                  selectedFolder?._id === folder._id 
                                    ? "text-white/70" 
                                    : "text-muted-foreground"
                                }`}>
                                  {folder.description}
                                </p>
                              )}
                            </div>
                          </button>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRename("folder", folder._id, folder.name)
                              }}
                              className={`p-1.5 rounded-md transition-colors ${
                                selectedFolder?._id === folder._id
                                  ? "hover:bg-white/20"
                                  : "hover:bg-muted"
                              }`}
                              title="Rename"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setFolderToDelete(folder)
                                setDeleteFolderDialog(true)
                              }}
                              className="p-1.5 hover:bg-red-50 rounded-md transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-red-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Documents Area */}
          <div className="lg:col-span-3 space-y-4">
            {selectedFolder ? (
              <React.Fragment>
                {/* Folder Header */}
                <Card className="shadow-md border-l-4 border-l-[#D4A84B]">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#D4A84B] to-[#B8922E] flex items-center justify-center shadow-lg">
                            <Folder className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h2 className="text-2xl font-bold text-foreground truncate">{selectedFolder.name}</h2>
                            {selectedFolder.description && (
                              <p className="text-sm text-muted-foreground mt-0.5">{selectedFolder.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <Badge variant="secondary" className="text-xs">
                            {documents.length} {documents.length === 1 ? 'document' : 'documents'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Created {new Date(selectedFolder.created_at).toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 items-start">
                        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                          <SelectTrigger className="w-35 border-border">
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="name">Name</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="size">Size</SelectItem>
                            <SelectItem value="type">Type</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="default"
                          onClick={() => {
                            setCurrentParentId(selectedFolder._id)
                            setFolderPath([...folderPath, selectedFolder])
                            setCreateFolderDialog(true)
                          }}
                          className="border-[#1B4F91]/20 text-[#1B4F91] hover:bg-[#1B4F91]/5"
                        >
                          <FolderPlus className="h-4 w-4 mr-2" />
                          Subfolder
                        </Button>
                        <Button
                          onClick={() => setUploadDialog(true)}
                          className="bg-linear-to-r from-[#D4A84B] to-[#B8922E] text-white hover:from-[#D4A84B]/90 hover:to-[#B8922E]/90 shadow-lg"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload File
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Documents List */}
                {isLoadingDocs ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Card key={i} className="shadow-sm">
                        <CardContent className="p-4">
                          <div className="h-16 bg-linear-to-r from-muted to-muted/50 rounded animate-pulse" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : documents.length === 0 ? (
                  <Card className="shadow-md">
                    <CardContent className="p-16 text-center">
                      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-linear-to-br from-muted to-muted/50 flex items-center justify-center">
                        <File className="h-10 w-10 text-muted-foreground/40" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
                      <p className="text-muted-foreground mb-4">Upload your first document to get started</p>
                      <Button
                        onClick={() => setUploadDialog(true)}
                        className="bg-linear-to-r from-[#1B4F91] to-[#2563eb] hover:from-[#1B4F91]/90 hover:to-[#2563eb]/90"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Document
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <Card 
                        key={doc._id} 
                        className="group shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-l-transparent hover:border-l-[#1B4F91]"
                      >
                        <CardContent className="p-5">
                          <div className="flex items-center gap-4">
                            {/* File Icon */}
                            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-muted to-muted/50 flex items-center justify-center text-2xl shrink-0 shadow-sm">
                              {getFileIcon(doc.file_type)}
                            </div>
                            
                            {/* File Info */}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-foreground truncate text-base group-hover:text-[#1B4F91] transition-colors">
                                {doc.file_name}
                              </p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4A84B]"></span>
                                  {formatFileSize(doc.file_size)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#1B4F91]"></span>
                                  {doc.uploaded_by_id?.name}
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                  {new Date(doc.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              {(doc.file_type.startsWith("image/") || doc.file_type === "application/pdf" || doc.file_type.startsWith("text/")) && (
                                <button
                                  onClick={() => handleViewDocument(doc._id, doc.file_name, doc.file_url, doc.file_type)}
                                  className="inline-flex items-center justify-center h-9 w-9 rounded-lg hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-200"
                                  title="View"
                                >
                                  <Eye className="h-4 w-4 text-[#1B4F91]" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDownload(doc._id, doc.file_name)}
                                className="inline-flex items-center justify-center h-9 w-9 rounded-lg hover:bg-green-50 transition-colors border border-transparent hover:border-green-200"
                                title="Download"
                              >
                                <Download className="h-4 w-4 text-green-600" />
                              </button>
                              <button
                                onClick={() => handleRename("document", doc._id, doc.file_name)}
                                className="inline-flex items-center justify-center h-9 w-9 rounded-lg hover:bg-amber-50 transition-colors border border-transparent hover:border-amber-200"
                                title="Rename"
                              >
                                <Edit2 className="h-4 w-4 text-amber-600" />
                              </button>
                              <button
                                onClick={() => handleDeleteDocument(doc._id)}
                                className="inline-flex items-center justify-center h-9 w-9 rounded-lg hover:bg-red-50 transition-colors border border-transparent hover:border-red-200"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </React.Fragment>
            ) : (
              <Card className="shadow-md">
                <CardContent className="p-16 text-center">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-linear-to-br from-[#1B4F91]/10 to-[#2563eb]/10 flex items-center justify-center">
                    <Folder className="h-12 w-12 text-[#1B4F91]" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Select a folder to view documents</h3>
                  <p className="text-muted-foreground">Choose a folder from the sidebar to see its contents</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Create Folder Dialog */}
      <Dialog open={createFolderDialog} onOpenChange={setCreateFolderDialog}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-[#1B4F91] to-[#2563eb] flex items-center justify-center">
                <FolderPlus className="h-5 w-5 text-white" />
              </div>
              Create New Folder
            </DialogTitle>
            <DialogDescription>Add a new folder to organize your documents</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name" className="text-sm font-medium">Folder Name *</Label>
              <Input
                id="folder-name"
                placeholder="e.g., Investor Documents"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="folder-desc" className="text-sm font-medium">Description</Label>
              <Input
                id="folder-desc"
                placeholder="Optional description"
                value={folderDescription}
                onChange={(e) => setFolderDescription(e.target.value)}
                className="h-11"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCreateFolderDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateFolder} 
              disabled={!folderName || isCreatingFolder} 
              className="bg-linear-to-r from-[#1B4F91] to-[#2563eb] hover:from-[#1B4F91]/90 hover:to-[#2563eb]/90"
            >
              {isCreatingFolder && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload File Dialog */}
      <Dialog open={uploadDialog} onOpenChange={setUploadDialog}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-[#D4A84B] to-[#B8922E] flex items-center justify-center">
                <Upload className="h-5 w-5 text-white" />
              </div>
              Upload Document
            </DialogTitle>
            <DialogDescription>Upload a file to {selectedFolder?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload" className="text-sm font-medium">Select File *</Label>
              <div className="relative">
                <input
                  id="file-upload"
                  type="file"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 border border-border rounded-lg cursor-pointer hover:border-[#1B4F91] transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#1B4F91] file:text-white hover:file:bg-[#1B4F91]/90"
                />
              </div>
              {uploadFile && (
                <div className="mt-3 p-3 bg-muted/50 rounded-lg border border-border">
                  <p className="text-sm font-medium text-foreground">{uploadFile.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatFileSize(uploadFile.size)}
                  </p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setUploadDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUploadFile} 
              disabled={!uploadFile || isUploading} 
              className="bg-linear-to-r from-[#D4A84B] to-[#B8922E] hover:from-[#D4A84B]/90 hover:to-[#B8922E]/90"
            >
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upload File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={renameDialog} onOpenChange={setRenameDialog}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Edit2 className="h-5 w-5 text-white" />
              </div>
              Rename {renameType === "folder" ? "Folder" : "Document"}
            </DialogTitle>
            <DialogDescription>Enter a new name for this {renameType}</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="rename-input" className="text-sm font-medium">Name *</Label>
              <Input
                id="rename-input"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRenameSubmit()
                }}
                className="h-11"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRenameDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRenameSubmit} 
              disabled={!renameValue || isRenaming} 
              className="bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              {isRenaming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Dialog */}
      <Dialog open={moveDialog} onOpenChange={setMoveDialog}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Move className="h-5 w-5 text-white" />
              </div>
              Move {moveType === "folder" ? "Folder" : "Document"}
            </DialogTitle>
            <DialogDescription>Select the destination folder</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="move-target" className="text-sm font-medium">Target Folder</Label>
              <Select value={moveTargetFolder || ""} onValueChange={setMoveTargetFolder}>
                <SelectTrigger id="move-target" className="h-11">
                  <SelectValue placeholder="Select folder (or leave empty for root)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Root (No parent)</SelectItem>
                  {allFolders
                    .filter((f) => moveType === "folder" && moveId ? f._id !== moveId : true)
                    .map((folder) => (
                      <SelectItem key={folder._id} value={folder._id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setMoveDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleMoveSubmit} 
              disabled={isMoving} 
              className="bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isMoving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Move
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Folder Dialog */}
      <Dialog open={deleteFolderDialog} onOpenChange={setDeleteFolderDialog}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-red-500 to-red-600 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-white" />
              </div>
              Delete Folder
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              Are you sure you want to delete <span className="font-semibold text-foreground">"{folderToDelete?.name}"</span>? 
              This action cannot be undone. The folder must be empty (no subfolders or documents).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-4">
            <Button variant="outline" onClick={() => setDeleteFolderDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteFolder} 
              disabled={isDeletingFolder} 
              variant="destructive"
              className="bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            >
              {isDeletingFolder && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Document Dialog */}
      <Dialog open={viewDialog} onOpenChange={(open) => {
        setViewDialog(open)
        if (!open) {
          setPdfLoadError(false)
          setViewingDocument(null)
        }
      }}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-linear-to-br from-[#1B4F91] to-[#2563eb] flex items-center justify-center">
                  <Eye className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-lg">{viewingDocument?.name}</DialogTitle>
                  <DialogDescription>Document viewer</DialogDescription>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setViewDialog(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-auto p-4 bg-muted/30 rounded-xl border">
            {viewingDocument && (
              <>
                {viewingDocument.type.startsWith("image/") ? (
                  <div className="flex items-center justify-center min-h-125">
                    <img
                      src={viewingDocument.url}
                      alt={viewingDocument.name}
                      className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-xl"
                    />
                  </div>
                ) : viewingDocument.type === "application/pdf" ? (
                  <div className="w-full h-[70vh] flex flex-col gap-2">
                    <div className="flex items-center justify-between p-3 bg-background rounded-lg border shadow-sm">
                      <p className="text-sm font-medium text-muted-foreground">PDF Viewer</p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            window.open(viewingDocument.url, "_blank", "noopener,noreferrer")
                          }}
                        >
                          Open in New Tab
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const doc = documents.find((d) => d.file_name === viewingDocument.name)
                            if (doc) {
                              handleDownload(doc._id, viewingDocument.name)
                            }
                          }}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                    {pdfLoadError ? (
                      <div className="flex-1 border rounded-lg bg-background flex flex-col items-center justify-center p-8 text-center shadow-sm">
                        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
                          <File className="h-8 w-8 text-red-500" />
                        </div>
                        <p className="text-foreground font-semibold text-lg mb-2">Unable to display PDF</p>
                        <p className="text-sm text-muted-foreground mb-6 max-w-md">
                          This may be due to CORS restrictions. Please use one of the options below:
                        </p>
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            onClick={() => {
                              window.open(viewingDocument.url, "_blank", "noopener,noreferrer")
                            }}
                          >
                            Open in New Tab
                          </Button>
                          <Button
                            onClick={() => {
                              const doc = documents.find((d) => d.file_name === viewingDocument.name)
                              if (doc) {
                                handleDownload(doc._id, viewingDocument.name)
                              }
                            }}
                            className="bg-linear-to-r from-[#1B4F91] to-[#2563eb]"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 border rounded-lg overflow-hidden bg-white shadow-sm">
                        <iframe
                          src={`${viewingDocument.url}#toolbar=1&navpanes=1&scrollbar=1`}
                          className="w-full h-full"
                          title={viewingDocument.name}
                          onLoad={() => {
                            setTimeout(() => {
                              const iframe = document.querySelector('iframe[title="' + viewingDocument.name + '"]') as HTMLIFrameElement
                              if (iframe && !iframe.contentDocument && !iframe.contentWindow) {
                                setPdfLoadError(true)
                              }
                            }, 2000)
                          }}
                          onError={() => {
                            setPdfLoadError(true)
                            toast({
                              title: "PDF View Error",
                              description: "Unable to display PDF in viewer. Use the buttons above to view or download.",
                              variant: "destructive",
                            })
                          }}
                        />
                      </div>
                    )}
                    {!pdfLoadError && (
                      <p className="text-xs text-muted-foreground text-center">
                        If the PDF doesn't load properly, click "Open in New Tab" or "Download" above
                      </p>
                    )}
                  </div>
                ) : viewingDocument.type.startsWith("text/") ? (
                  <div className="bg-background p-4 rounded-lg border shadow-sm max-h-[70vh] overflow-auto">
                    <iframe
                      src={viewingDocument.url}
                      className="w-full h-[70vh] border rounded"
                      title={viewingDocument.name}
                      sandbox="allow-same-origin"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center min-h-125 text-center">
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                      <File className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <p className="text-lg font-medium mb-2">Preview not available</p>
                    <p className="text-muted-foreground mb-4">This file type cannot be previewed in the browser</p>
                    <Button
                      variant="outline"
                      onClick={() => viewingDocument && handleDownload(documents.find(d => d.file_name === viewingDocument.name)?._id || "", viewingDocument.name)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download to view
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setViewDialog(false)}>
              Close
            </Button>
            {viewingDocument && (
              <Button
                onClick={() => {
                  const doc = documents.find((d) => d.file_name === viewingDocument.name)
                  if (doc) {
                    handleDownload(doc._id, viewingDocument.name)
                  }
                }}
                className="bg-linear-to-r from-[#1B4F91] to-[#2563eb] hover:from-[#1B4F91]/90 hover:to-[#2563eb]/90"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}