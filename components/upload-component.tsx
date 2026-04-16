"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UploadCloud, Check, X, Loader2, FileText, AlertCircle, ImageIcon, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadComponentProps {
  onUploadSuccess: (url: string, filename: string) => void
  acceptedFileTypes?: string
  buttonText?: string
  className?: string
  currentUrl?: string
  autoReset?: boolean
}

export function UploadComponent({
  onUploadSuccess,
  acceptedFileTypes = "image/*,application/pdf",
  buttonText = "Upload Arquivo",
  className,
  currentUrl,
  autoReset = false,
}: UploadComponentProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null)
  const [fileName, setFileName] = useState<string | null>(currentUrl ? currentUrl.split("/").pop()! : null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Atualizar preview se o currentUrl mudar externamente
  useEffect(() => {
    if (currentUrl) {
      setPreviewUrl(currentUrl)
      if (!fileName) setFileName(currentUrl.split("/").pop()! )
    }
  }, [currentUrl])

  const isImage = (url: string | null) => {
    if (!url) return false
    return url.match(/\.(jpeg|jpg|gif|png|webp|svg)/i) || url.startsWith('data:image') || previewUrl?.includes('token') // Supabase patterns
  }

  const handleUpload = async (fileToUpload: File) => {
    setUploading(true)
    setError(null)
    setSuccess(null)
    setFileName(fileToUpload.name)

    // Preview local imediato
    if (fileToUpload.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onloadend = () => setPreviewUrl(reader.result as string)
      reader.readAsDataURL(fileToUpload)
    } else {
      setPreviewUrl(null)
    }

    // 1. Validar Limites de Tamanho Dinâmicos no Cliente
    const isPDF = fileToUpload.type === 'application/pdf'
    const limit = isPDF ? 5 * 1024 * 1024 : 1 * 1024 * 1024
    
    if (fileToUpload.size > limit) {
      const limitText = isPDF ? "5MB" : "1MB"
      setError(`Arquivo muito grande. Limite para ${isPDF ? 'PDFs' : 'Imagens'} é de ${limitText}.`)
      setUploading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append("file", fileToUpload)


      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const blob = await response.json()

      if (!response.ok) {
        throw new Error(blob.error || "Falha no upload")
      }

      setSuccess("Arquivo enviado!")
      setPreviewUrl(blob.arquivo.url)
      
      if (autoReset) {
        setTimeout(() => {
          setSuccess(null)
          setPreviewUrl(null)
          setFileName(null)
        }, 2000)
      }

      onUploadSuccess(blob.arquivo.url, blob.arquivo.nome)
    } catch (err: any) {
      console.error("Erro no upload:", err)
      setError(err.message || "Erro no upload")
      setPreviewUrl(null)
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleUpload(e.target.files[0])
  }

  const resetUpload = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSuccess(null)
    setError(null)
    setPreviewUrl(null)
    setFileName(null)
    onUploadSuccess("", "")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const hasFile = !!previewUrl || !!currentUrl

  return (
    <div className={cn("w-full transition-all duration-300", className)}>
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          if (e.dataTransfer.files?.[0]) handleUpload(e.dataTransfer.files[0])
        }}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={cn(
          "relative group cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-4 text-center min-h-[120px]",
          isDragging ? "border-green-500 bg-green-50/50" : "border-slate-200 hover:border-green-400 hover:bg-slate-50/10",
          hasFile && !error && "border-green-200 bg-green-50/5",
          error && "border-red-200 bg-red-50/30",
          uploading && "pointer-events-none opacity-70"
        )}
      >
        <Input
          ref={fileInputRef}
          type="file"
          accept={acceptedFileTypes}
          onChange={handleFileChange}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
            <p className="text-[10px] font-bold text-green-700">Enviando...</p>
          </div>
        ) : hasFile && !error ? (
          <div className="flex flex-col items-center gap-2 w-full animate-in fade-in zoom-in duration-300">
             <div className="relative group/preview w-24 h-16 rounded-lg overflow-hidden border bg-white shadow-sm flex items-center justify-center">
                {isImage(previewUrl || currentUrl) ? (
                  <img src={previewUrl || currentUrl || ""} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center">
                    <FileText className="h-6 w-6 text-red-500" />
                    <span className="text-[8px] font-bold text-slate-400">PDF</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                   <Button type="button" variant="link" size="sm" className="h-6 text-[9px] text-white p-0">
                      Trocar
                   </Button>
                </div>
                {success && (
                  <div className="absolute top-0 right-0 bg-green-500 text-white p-0.5 rounded-bl-lg">
                    <Check className="h-3 w-3" />
                  </div>
                )}
             </div>
             <p className="text-[9px] text-slate-500 truncate max-w-[150px] font-medium">{fileName}</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-1 text-red-600">
            <AlertCircle className="h-6 w-6" />
            <p className="text-[10px] font-bold">Erro no envio</p>
            <Button type="button" variant="ghost" size="sm" onClick={resetUpload} className="h-6 text-[8px]">Tentar novamente</Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-green-100 group-hover:text-green-600 transition-all">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-600 group-hover:text-green-700 capitalize">{buttonText}</p>
              <p className="text-[9px] text-slate-400">PDF ou Imagem (Máx 5MB)</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}