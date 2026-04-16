"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UploadCloud, Check, X, Loader2, FileJson, AlertCircle, ImageIcon } from "lucide-react"
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
  const [success, setSuccess] = useState<string | null>(currentUrl ? "Arquivo carregado" : null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null)
  const [fileName, setFileName] = useState<string | null>(currentUrl ? currentUrl.split("/").pop()! : null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (fileToUpload: File) => {
    setUploading(true)
    setError(null)
    setSuccess(null)
    setFileName(fileToUpload.name)

    // Gerar preview local se for imagem
    if (fileToUpload.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(fileToUpload)
    } else {
      setPreviewUrl(null)
    }

    try {
      const formData = new FormData()
      formData.append("file", fileToUpload)
      formData.append("nome", fileToUpload.name)
      formData.append("tipo", fileToUpload.type)
      formData.append("categoria", "documento")

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const text = await response.text()
      let blob
      try {
        blob = JSON.parse(text)
      } catch (err) {
        console.error("A resposta não é JSON:", text)
        throw new Error("Resposta inválida do servidor.")
      }

      if (!response.ok) {
        throw new Error(blob.error || "Falha no upload do arquivo.")
      }

      if (autoReset) {
        setTimeout(() => {
          setSuccess(null)
          setPreviewUrl(null)
          setFileName(null)
        }, 1500)
      }

      onUploadSuccess(blob.arquivo.url, blob.arquivo.id)
    } catch (err: any) {
      console.error("Erro durante o upload:", err)
      setError(err.message || "Ocorreu um erro no upload.")
      setPreviewUrl(null)
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      handleUpload(event.target.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0])
    }
  }

  const resetUpload = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSuccess(null)
    setError(null)
    setPreviewUrl(null)
    setFileName(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={cn("w-full transition-all duration-300", className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={cn(
          "relative group cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-6 text-center min-h-[140px]",
          isDragging 
            ? "border-green-500 bg-green-50/50 scale-[1.01] shadow-lg" 
            : "border-slate-200 hover:border-green-400 hover:bg-slate-50/50",
          success && "border-green-500 bg-green-50/30",
          error && "border-red-200 bg-red-50/30",
          uploading && "pointer-events-none border-green-200 bg-slate-50"
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
          <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-300">
            <div className="relative">
              <Loader2 className="h-10 w-10 text-green-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-1.5 w-1.5 bg-green-600 rounded-full animate-ping" />
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-green-700">Enviando arquivo...</p>
              <p className="text-[10px] text-slate-400 mt-1 truncate max-w-[200px]">{fileName}</p>
            </div>
          </div>
        ) : success ? (
          <div className="flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-500">
             {previewUrl ? (
               <div className="relative w-24 h-16 rounded-lg overflow-hidden border border-green-200 shadow-sm bg-white mb-1">
                 <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                 <div className="absolute top-0 right-0 p-0.5 bg-green-500 text-white rounded-bl-lg">
                   <Check className="h-3 w-3" />
                 </div>
               </div>
             ) : (
               <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-1">
                 <Check className="h-6 w-6" />
               </div>
             )}
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-green-700">{success}</p>
              <p className="text-[10px] text-slate-500 truncate max-w-[220px]">{fileName}</p>
            </div>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={resetUpload}
              className="mt-2 h-7 rounded-lg text-[10px] font-bold text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              Trocar arquivo
            </Button>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-2 animate-in slide-in-from-top-2 duration-300">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <AlertCircle className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-red-600">Falha no envio</p>
            <p className="text-[10px] text-red-400 max-w-[200px] leading-tight">{error}</p>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={resetUpload}
              className="mt-2 h-8 rounded-xl border-red-200 text-red-600 hover:bg-red-50"
            >
              Tentar novamente
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-green-100 group-hover:text-green-600 group-hover:rotate-6 transition-all duration-500">
              {acceptedFileTypes.includes("image") ? <ImageIcon className="h-7 w-7" /> : <FileJson className="h-7 w-7" />}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-600 group-hover:text-green-700 transition-colors">{buttonText}</p>
              <p className="text-[10px] text-slate-400 mt-1">Arraste ou clique para selecionar</p>
            </div>
          </div>
        )}

        {/* Efeito de brilho no hover */}
        {!uploading && !success && !error && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-tr from-green-500/5 via-transparent to-green-500/5 pointer-events-none transition-opacity duration-700" />
        )}
      </div>
    </div>
  )
}