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
import { Loader2, FolderPlus, Upload, Download, Trash2, File, Folder } from "lucide-react"

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
      const data = await libraryApi.getDocuments(folderId, token)
      setDocuments(data.documents || [])
    } catch (error) {
      console.error("Failed to fetch documents:", error)
      toast({ title: "Error", description: "Failed to load documents", variant: "destructive" })
    } finally {
      setIsLoadingDocs(false)
    }
  }

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
    try {
      await libraryApi.deleteDocument(documentId, token)
      toast({ title: "Success", description: "Document deleted" })
      fetchDocuments(selectedFolder._id)
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
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
                      <button
                        key={folder._id}
                        onClick={() => handleFolderClick(folder)}
                        onDoubleClick={() => handleEnterFolder(folder)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${
                          selectedFolder?._id === folder._id
                            ? "bg-[#1B4F91] text-white"
                            : "hover:bg-muted text-foreground"
                        }`}
                      >
                        <Folder className="h-4 w-4" />
                        {folder.name}
                      </button>
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
                  <div className="flex gap-2">
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
                              <a
                                href={doc.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-muted"
                              >
                                <Download className="h-4 w-4 text-[#1B4F91]" />
                              </a>
                              <button
                                onClick={() => handleDeleteDocument(doc._id)}
                                className="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-red-100"
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
    </DashboardLayout>
  )
}
