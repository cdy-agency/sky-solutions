"use client"

import React, { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth-context"
import { libraryApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Loader2, FolderPlus, Upload, Download, Trash2, File, Folder, Edit2, Move, MoreVertical } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
      const link = document.createElement("a")
      link.href = data.download_url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to download file", variant: "destructive" })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Document Library</h1>
            <p className="text-muted-foreground">Manage and organize business documents</p>
          </div>
          <Button onClick={() => setCreateFolderDialog(true)} className="bg-[#1B4F91]">
            <FolderPlus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Folders sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Folders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {isLoadingFolders ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-10 bg-muted rounded animate-pulse" />
                    ))}
                  </div>
                ) : folders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No folders yet</p>
                ) : (
                  <>
                    {folderPath.length > 0 && (
                      <button
                        onClick={handleNavigateUp}
                        className="w-full text-left px-3 py-2 rounded-md text-sm transition-colors hover:bg-muted text-foreground flex items-center gap-2"
                      >
                        <Folder className="h-4 w-4" />
                        .. (Up)
                      </button>
                    )}
                    {folders.map((folder) => (
                      <div
                        key={folder._id}
                        className={`group flex items-center gap-2 rounded-md text-sm transition-colors ${
                          selectedFolder?._id === folder._id
                            ? "bg-[#1B4F91] text-white"
                            : "hover:bg-muted text-foreground"
                        }`}
                      >
                        <button
                          onClick={() => handleFolderClick(folder)}
                          onDoubleClick={() => handleEnterFolder(folder)}
                          className="flex-1 text-left px-3 py-2 flex items-center gap-2"
                        >
                          <Folder className="h-4 w-4" />
                          {folder.name}
                        </button>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRename("folder", folder._id, folder.name)
                            }}
                            className="p-1 hover:bg-black/10 rounded"
                            title="Rename"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setFolderToDelete(folder)
                              setDeleteFolderDialog(true)
                            }}
                            className="p-1 hover:bg-red-100 rounded"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Documents */}
          <div className="lg:col-span-3 space-y-4">
            {selectedFolder && (
              <React.Fragment>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{selectedFolder.name}</h2>
                    {selectedFolder.description && (
                      <p className="text-sm text-muted-foreground">{selectedFolder.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2 items-center">
                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <SelectTrigger className="w-[140px]">
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
                      onClick={() => {
                        setCurrentParentId(selectedFolder._id)
                        setFolderPath([...folderPath, selectedFolder])
                        setCreateFolderDialog(true)
                      }}
                    >
                      <FolderPlus className="h-4 w-4 mr-2" />
                      Create Subfolder
                    </Button>
                    <Button
                      onClick={() => setUploadDialog(true)}
                      className="bg-[#D4A84B] text-black hover:bg-[#D4A84B]/90"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </Button>
                  </div>
                </div>

                {isLoadingDocs ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                    ))}
                  </div>
                ) : documents.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <File className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                      <p className="text-muted-foreground">No documents in this folder</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <Card key={doc._id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <File className="h-6 w-6 text-muted-foreground" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground truncate">{doc.file_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(doc.file_size)} • {doc.uploaded_by_id?.name} •{" "}
                                  {new Date(doc.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleDownload(doc._id, doc.file_name)}
                                className="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-muted"
                                title="Download"
                              >
                                <Download className="h-4 w-4 text-[#1B4F91]" />
                              </button>
                              <button
                                onClick={() => handleRename("document", doc._id, doc.file_name)}
                                className="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-muted"
                                title="Rename"
                              >
                                <Edit2 className="h-4 w-4 text-[#1B4F91]" />
                              </button>
                                {/* <button
                                  onClick={() => handleMove("document", doc._id)}
                                  className="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-muted"
                                  title="Move"
                                >
                                  <Move className="h-4 w-4 text-[#1B4F91]" />
                                </button> */}
                              <button
                                onClick={() => handleDeleteDocument(doc._id)}
                                className="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-red-100"
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
            )}
          </div>
        </div>
      </div>

      {/* Create Folder Dialog */}
      <Dialog open={createFolderDialog} onOpenChange={setCreateFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>Add a new folder to organize documents</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name">Folder Name *</Label>
              <Input
                id="folder-name"
                placeholder="e.g., Investor Documents"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="folder-desc">Description</Label>
              <Input
                id="folder-desc"
                placeholder="Optional description"
                value={folderDescription}
                onChange={(e) => setFolderDescription(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCreateFolderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={!folderName || isCreatingFolder} className="bg-[#1B4F91]">
              {isCreatingFolder && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload File Dialog */}
      <Dialog open={uploadDialog} onOpenChange={setUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>Upload a file to {selectedFolder?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Select File *</Label>
              <input
                id="file-upload"
                type="file"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-border rounded-md"
              />
              {uploadFile && <p className="text-sm text-muted-foreground">{uploadFile.name}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setUploadDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUploadFile} disabled={!uploadFile || isUploading} className="bg-[#1B4F91]">
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upload
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={renameDialog} onOpenChange={setRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename {renameType === "folder" ? "Folder" : "Document"}</DialogTitle>
            <DialogDescription>Enter a new name for this {renameType}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rename-input">Name *</Label>
              <Input
                id="rename-input"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRenameSubmit()
                }}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setRenameDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameSubmit} disabled={!renameValue || isRenaming} className="bg-[#1B4F91]">
              {isRenaming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Rename
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Move Dialog */}
      <Dialog open={moveDialog} onOpenChange={setMoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move {moveType === "folder" ? "Folder" : "Document"}</DialogTitle>
            <DialogDescription>Select the destination folder</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="move-target">Target Folder</Label>
              <Select value={moveTargetFolder || ""} onValueChange={setMoveTargetFolder}>
                <SelectTrigger id="move-target">
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
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setMoveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleMoveSubmit} disabled={isMoving} className="bg-[#1B4F91]">
              {isMoving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Move
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Folder Dialog */}
      <Dialog open={deleteFolderDialog} onOpenChange={setDeleteFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Folder</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{folderToDelete?.name}"? This action cannot be undone. The folder must be
              empty (no subfolders or documents).
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setDeleteFolderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleDeleteFolder} disabled={isDeletingFolder} variant="destructive">
              {isDeletingFolder && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
