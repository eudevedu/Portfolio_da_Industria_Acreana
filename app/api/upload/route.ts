import { NextResponse } from "next/server"
import { createServerSideClient, createAdminClient } from '@/lib/supabase'
import { randomUUID } from 'crypto'
import { getCurrentUser } from "@/lib/auth"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

async function uploadToSupabase(file: File): Promise<string> {
  const supabase = createAdminClient()
  const timestamp = Date.now()
  const fileExt = file.name.split('.').pop()
  const fileName = `${timestamp}-${randomUUID()}.${fileExt}`
  
  const bucket = file.type.includes('pdf') ? 'PDF' : 'Imagem'
  
  const { data, error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false
    })

  if (uploadError) throw new Error(`Falha no upload: ${uploadError.message}`)

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName)

  return publicUrl
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const nome = formData.get("nome") as string
    const categoria = formData.get("categoria") as string

    if (!file || !nome) {
      return NextResponse.json({ success: false, error: "Arquivo e nome são obrigatórios" }, { status: 400 })
    }

    // Validações de Segurança
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: "Arquivo muito grande (máximo 5MB)" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, error: "Tipo de arquivo não permitido" }, { status: 400 })
    }

    const fileUrl = await uploadToSupabase(file)

    return NextResponse.json({
      success: true,
      arquivo: {
        url: fileUrl,
        nome,
        categoria
      },
      message: "Arquivo enviado com sucesso!",
    })
  } catch (error: any) {
    console.error("Upload API Error:", error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Erro interno do servidor" 
    }, { status: 500 })
  }
}
