import { NextResponse } from "next/server"
import { createServerSideClient } from '@/lib/supabase'
import { randomUUID } from 'crypto'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const supabase = await createServerSideClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    // Se não houver usuário, permitimos o upload mas em uma pasta pública de cadastro
    const ownerId = user?.id || "public-registration"


    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json({ success: false, error: "Arquivo não fornecido" }, { status: 400 })
    }

    // 2. Validar Limites de Tamanho Dinâmicos
    const isPDF = file.type === 'application/pdf'
    const limit = isPDF ? 5 * 1024 * 1024 : 1 * 1024 * 1024
    
    if (file.size > limit) {
      const limitText = isPDF ? "5MB" : "1MB"
      return NextResponse.json({ 
        success: false, 
        error: `O arquivo excede o limite permitido para ${isPDF ? 'PDFs' : 'Imagens'} (${limitText}).` 
      }, { status: 400 })
    }

    // 3. Validar Tipo
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, error: "Tipo de arquivo não permitido" }, { status: 400 })
    }


    // 4. Upload para Supabase Storage (Usando Admin Client para contornar RLS do Storage)
    const { createAdminClient } = await import('@/lib/supabase')
    const supabaseAdmin = createAdminClient()
    
    const fileExt = file.name.split('.').pop()
    const fileName = `${ownerId}/${Date.now()}-${randomUUID()}.${fileExt}`
    const bucket = file.type.includes('pdf') ? 'PDF' : 'Imagem'

    const { data, error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      })


    if (uploadError) throw uploadError

    // Retorna caminho relativo para o nosso Proxy (Agnóstico de DNS)
    const relativeUrl = `/api/storage/${bucket}/${fileName}`

    return NextResponse.json({
      success: true,
      arquivo: {
        url: relativeUrl,
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
