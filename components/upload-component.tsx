"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UploadCloud } from "lucide-react"

interface UploadComponentProps {
  onUploadSuccess: (url: string, filename: string) => void
  acceptedFileTypes?: string
  buttonText?: string
}

export function UploadComponent({
  onUploadSuccess,
  acceptedFileTypes = "image/*,application/pdf",
  buttonText = "Upload Arquivo",
}: UploadComponentProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0])
      setError(null)
      setSuccess(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Por favor, selecione um arquivo para upload.")
      return
    }

    setUploading(true)
    setError(null)
    setSuccess(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("nome", file.name)
      formData.append("tipo", file.type)
      formData.append("categoria", "documento") // ou outro valor se desejar

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
        setError("Falha no upload: resposta inesperada do servidor.\nConteúdo recebido:\n" + text.slice(0, 200))
        setUploading(false)
        return
      }

      if (!response.ok) {
        throw new Error(blob.error || "Falha no upload do arquivo.")
      }

      setSuccess("Upload realizado com sucesso!")
      onUploadSuccess(blob.arquivo.url, blob.arquivo.id)
      setFile(null) // Clear the file input after successful upload
    } catch (err: any) {
      console.error("Erro durante o upload:", err)
      setError(err.message || "Ocorreu um erro inesperado durante o upload.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="file-upload" className="sr-only">
          Escolher arquivo
        </Label>
        <Input
          id="file-upload"
          type="file"
          accept={acceptedFileTypes}
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-green-50 file:text-green-700
            hover:file:bg-green-100"
        />
        {file && <p className="mt-2 text-sm text-gray-600">Arquivo selecionado: {file.name}</p>}
      </div>
      <Button onClick={handleUpload} disabled={uploading || !file}>
        {uploading ? (
          <>
            <UploadCloud className="h-4 w-4 mr-2 animate-pulse" />
            Enviando...
          </>
        ) : (
          <>
            <UploadCloud className="h-4 w-4 mr-2" />
            {buttonText}
          </>
        )}
      </Button>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-green-500">{success}</p>}
    </div>
  )
}

async function uploadArquivo(url: string, options: RequestInit) {
  try {
    const response = await fetch(url, options);
    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("A resposta não é JSON:", text);
      throw new Error("Erro no upload: resposta inesperada do servidor.");
    }

    return data;
  } catch (error) {
    console.error("Erro durante o upload:", error);
    throw error;
  }
}