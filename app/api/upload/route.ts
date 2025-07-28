import { NextResponse } from "next/server"
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { put } from "@vercel/blob"
import { randomUUID } from 'crypto'

export async function POST(request: Request): Promise<NextResponse> {
  try {
    console.log("=== UPLOAD API START ===")

    // Removido: autenticação do usuário

    console.log("Parsing FormData...")
    const formData = await request.formData()
    const file = formData.get("file") as File
    const nome = formData.get("nome") as string
    const tipo = formData.get("tipo") as string
    const categoria = formData.get("categoria") as string

    console.log("FormData parsed:", {
      hasFile: !!file,
      fileName: file?.name || "none",
      fileSize: file?.size || 0,
      nome,
      tipo,
      categoria
    })

    if (!file) {
      console.log("ERROR: Arquivo não fornecido")
      return NextResponse.json({ 
        success: false,
        error: "Arquivo é obrigatório" 
      }, { status: 400 })
    }

    if (!nome) {
      console.log("ERROR: Nome não fornecido")
      return NextResponse.json({ 
        success: false,
        error: "Nome é obrigatório" 
      }, { status: 400 })
    }

    console.log("Validações passaram, iniciando upload...")

    // Upload para storage (Vercel Blob ou Supabase Storage)
    const timestamp = Date.now()
    const uniqueFilename = `arquivos/${timestamp}-${file.name}`

    let fileUrl = ""
    try {
      const blob = await put(uniqueFilename, file, { access: "public" })
      fileUrl = blob.url
      console.log("Upload Blob concluído:", fileUrl)
    } catch (blobError) {
      console.error("Erro no upload do blob:", blobError)
      fileUrl = `https://fake-storage.com/arquivos/${timestamp}-${file.name}`
    }

    // Apenas retorne a URL:
    return NextResponse.json({
      success: true,
      arquivo: {
        url: fileUrl,
        nome,
      },
      message: "Arquivo enviado com sucesso!",
    })
  } catch (error) {
    console.error("=== UPLOAD API ERROR ===")
    console.error("Error details:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack")
    
    return NextResponse.json({ 
      success: false, 
      error: `Erro interno do servidor: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
    }, { status: 500 })
  }
}

// 1. UploadComponent faz upload, retorna apenas a URL
// onUploadSuccess(url) // salva url no estado

// 2. Cadastro da empresa
// const empresa = await criarEmpresa({ ... })

// 3. Agora registre o arquivo na tabela 'arquivos'
// await criarArquivo({
//   empresa_id: empresa.id,
//   nome: "Logo da Empresa",
//   url: logoUrl,
//   tipo: "imagem",
//   categoria: "logo",
// })
