"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ImageUploadModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ImageUploadModal({ isOpen, onClose }: ImageUploadModalProps) {
  const [image, setImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const router = useRouter()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxFiles: 1,
  })

  const handleDetect = async () => {
    if (!image) return

    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/detect-media", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image }),
      })

      if (!response.ok) {
        throw new Error("Failed to analyze image")
      }

      const data = await response.json()
      
      // Store result in localStorage or pass via query params (might be too large)
      // For now, let's use localStorage to pass the result to the results page
      localStorage.setItem("imageDetectionResult", JSON.stringify(data.result))
      localStorage.setItem("detectedImage", image)
      
      // Dispatch event to notify results page
      window.dispatchEvent(new Event("image-search-updated"))
      
      router.push("/search/image")
      onClose()
    } catch (error) {
      console.error("Error detecting media:", error)
      toast.error("Failed to analyze image. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setImage(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Search by Image</DialogTitle>
          <DialogDescription>Use AI to find out which movie or tv show an image is from.</DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {!image ? (
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
                ${isDragActive ? "border-primary bg-primary/10" : "border-muted-foreground/25 hover:border-primary/50"}
              `}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-2">
                <div className="p-4 rounded-full bg-muted">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="text-sm font-medium">
                  {isDragActive ? "Drop the image here" : "Drag & drop an image here"}
                </div>
                <div className="text-xs text-muted-foreground">
                  or click to select a file
                </div>
              </div>
            </div>
          ) : (
            <div className="relative rounded-lg overflow-hidden border bg-muted/50 aspect-video flex items-center justify-center">
              <img
                src={image}
                alt="Preview"
                className="max-h-full max-w-full object-contain"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full"
                onClick={clearImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <Button
            onClick={handleDetect}
            disabled={!image || isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <ImageIcon className="h-4 w-4" />
                AI Detect
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
