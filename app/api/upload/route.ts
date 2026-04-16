import { NextResponse } from "next/server"
import { createServerSideClient } from '@/lib/supabase'
import { randomUUID } from 'crypto'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const supabase = await createServerSideClient()
    
    // 1. Validar Autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Não autorizado" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json({ success: false, error: "Arquivo não fornecido" }, { status: 400 })
    }

    // 2. Validar Tamanho
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: "Arquivo muito grande (máx 5MB)" }, { status: 400 })
    }

    // 3. Validar Tipo
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, error: "Tipo de arquivo não permitido" }, { status: 400 })
    }

    // 4. Upload para Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}-${randomUUID()}.${fileExt}`
    const bucket = file.type.includes('pdf') ? 'PDF' : 'Imagem'

    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)

    return NextResponse.json({
      success: true,
      arquivo: {
        url: publicUrl,
        nome: file.name,
      },
      message: "Upload concluído com sucesso!",
    })

  } catch (error: any) {
    console.error("Erro no Upload API:", error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Erro interno no servidor" 
    }, { status: 500 })
  }
}
