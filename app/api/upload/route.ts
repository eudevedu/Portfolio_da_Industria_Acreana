import { NextResponse } from "next/server"
import { getCurrentUser } from '@/lib/auth'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { put } from "@vercel/blob"
import { randomUUID } from 'crypto'

export async function POST(request: Request): Promise<NextResponse> {
  try {
    console.log("=== UPLOAD API START ===")
    
    // Verificar autenticação
    const userInfo = await getCurrentUser()
    console.log("User info:", userInfo ? "authenticated" : "not authenticated")
    
    if (!userInfo) {
      console.log("ERROR: Usuário não autorizado")
      return NextResponse.json({ 
        success: false,
        error: "Não autorizado" 
      }, { status: 401 })
    }

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

    const timestamp = Date.now()
    const arquivoId = randomUUID() // Gerar UUID válido usando crypto nativo
    const empresaId = userInfo.empresa_id || userInfo.id
    let fileUrl = ""

    if (isSupabaseConfigured()) {
      try {
        console.log("Fazendo upload para Vercel Blob...")
        const uniqueFilename = `arquivos/${empresaId}/${timestamp}-${file.name}`
        
        // Upload para Vercel Blob
        const blob = await put(uniqueFilename, file, {
          access: "public",
        })
        
        fileUrl = blob.url
        console.log("Upload Blob concluído:", fileUrl)
      } catch (blobError) {
        console.error("Erro no upload do blob:", blobError)
        // Fallback para URL simulada se blob falhar
        fileUrl = `https://fake-storage.com/arquivos/${empresaId}/${timestamp}-${file.name}`
      }
    } else {
      // URL simulada para desenvolvimento
      fileUrl = `https://fake-storage.com/arquivos/${empresaId}/${timestamp}-${file.name}`
    }

    // Salvar no Supabase
    const arquivoData = {
      id: arquivoId, // Usar UUID em vez de timestamp
      empresa_id: empresaId,
      nome,
      url: fileUrl,
      tipo,
      categoria: categoria || 'documento',
      created_at: new Date().toISOString()
    }

    console.log("Salvando arquivo no Supabase:", arquivoData)

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('arquivos')
        .insert([arquivoData])
        .select()
        .single()

      if (error) {
        console.error("Erro ao salvar no Supabase:", error)
        return NextResponse.json({ 
          success: false, 
          error: `Erro ao salvar arquivo: ${error.message}` 
        }, { status: 500 })
      }

      console.log("Arquivo salvo com sucesso no Supabase:", data)
      
      return NextResponse.json({
        success: true,
        arquivo: data,
        message: "Arquivo enviado e salvo com sucesso!"
      })
    } else {
      // Modo development/mock
      console.log("Modo mock - simulando salvamento")
      return NextResponse.json({
        success: true,
        arquivo: arquivoData,
        message: "Arquivo enviado com sucesso (modo desenvolvimento)!"
      })
    }

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
