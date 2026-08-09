'use client'

import { useCallback, useRef, useState } from 'react'
import { Camera, X, Upload, Loader2, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export interface ScreenshotUploaderProps {
  onAnalyze: (base64: string, mimeType: string) => void
  compact?: boolean
}

export function ScreenshotUploader({ onAnalyze, compact = false }: ScreenshotUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [base64Data, setBase64Data] = useState<string | null>(null)
  const [mimeType, setMimeType] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Hanya file gambar yang didukung (PNG, JPG, JPEG)')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 10MB')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const base64 = result.split(',')[1]
      setPreview(result)
      setBase64Data(base64)
      setMimeType(file.type)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) processFile(file)
      if (fileInputRef.current) fileInputRef.current.value = ''
    },
    [processFile]
  )

  const handleAnalyze = async () => {
    if (!base64Data || !mimeType) return
    setIsAnalyzing(true)
    try {
      onAnalyze(base64Data, mimeType)
      clearImage()
    } catch {
      toast.error('Gagal menganalisis screenshot')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const clearImage = () => {
    setPreview(null)
    setBase64Data(null)
    setMimeType(null)
    setShowPreview(false)
  }

  // Compact mode: just a button to open file picker
  if (compact && !preview) {
    return (
      <>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className="hidden"
          onChange={handleFileSelect}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="alpha-press h-8 w-8 text-alpha-text-muted hover:text-alpha-text-primary hover:bg-alpha-surface rounded-lg"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Upload screenshot"
        >
          <Camera className="w-4 h-4" />
        </Button>
      </>
    )
  }

  // Preview compact mode
  if (compact && preview) {
    return (
      <div className="flex items-center gap-2 p-2 rounded-lg border border-alpha-border bg-alpha-surface">
        <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
          <img src={preview} alt="Screenshot preview" className="w-full h-full object-cover" />
        </div>
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <Button
            size="sm"
            variant="default"
            className="alpha-press h-7 px-3 text-xs rounded-md"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
            ) : (
              <Eye className="w-3 h-3 mr-1.5" />
            )}
            Analisis Chart
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="alpha-press h-7 w-7 p-0 text-alpha-text-muted hover:text-alpha-error rounded-md"
            onClick={clearImage}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    )
  }

  // Full drop zone mode
  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'alpha-animate-scale alpha-press relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200',
          isDragging
            ? 'border-alpha-primary bg-alpha-primary/5'
            : 'border-alpha-border hover:border-alpha-primary/30 hover:bg-alpha-primary/3'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className="hidden"
          onChange={handleFileSelect}
        />

        <div className="w-10 h-10 rounded-lg bg-alpha-primary/10 flex items-center justify-center mb-3">
          <Upload className="w-5 h-5 text-alpha-primary" />
        </div>

        <p className="alpha-body text-center">
          <span className="font-medium text-alpha-text-primary">Klik untuk upload</span> atau drag & drop
        </p>
        <p className="alpha-caption mt-1">
          PNG, JPG, JPEG hingga 10MB
        </p>
      </div>

      {preview && (
        <div className="space-y-3">
          <div className="relative rounded-xl overflow-hidden border border-alpha-border">
            <img
              src={preview}
              alt="Screenshot preview"
              className={cn(
                'w-full object-contain transition-all duration-300',
                showPreview ? 'max-h-80' : 'max-h-20'
              )}
            />
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowPreview(!showPreview)
              }}
              className="absolute bottom-2 right-2 px-2 py-1 text-[10px] bg-[#0B0D17]/80 rounded-md text-alpha-text-secondary hover:text-alpha-text-primary"
            >
              {showPreview ? 'Minimize' : 'Expand'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="alpha-press flex-1 rounded-lg"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Menganalisis...
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 mr-1.5" />
                  Analisis Chart
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="alpha-press rounded-lg"
              onClick={clearImage}
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Batal
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}