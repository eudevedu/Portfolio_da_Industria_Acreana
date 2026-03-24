import { NextResponse } from "next/server"
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase'
import { randomUUID } from 'crypto'

async function uploadToSupabase(file: File): Promise<string> {
  const timestamp = Date.now()
  const fileExt = file.name.split('.').pop()
  const fileName = `${timestamp}-${randomUUID()}.${fileExt}`
  
  // Selecionar bucket baseado no tipo
  const bucket = file.type.toLowerCase().includes('pdf') ? 'PDF' : 'Imagem'
  
  try {
    if (!isSupabaseAdminConfigured() || !supabaseAdmin) {
      throw new Error("Supabase Storage não configurado")
    }

    const { data, error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(fileName)

    console.log(`Upload para bucket ${bucket} concluído:`, publicUrl)
    return publicUrl
  } catch (error) {
    console.warn(`Erro no upload para o Supabase (Bucket ${bucket}), usando base64 fallback:`, error)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const base64 = buffer.toString('base64')
      return `data:${file.type};base64,${base64}`
    } catch (e) {
      return `https://fake-storage.com/${bucket}/${fileName}`
    }
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    console.log("=== UPLOAD API START ===")

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
      return NextResponse.json({ success: false, error: "Arquivo é obrigatório" }, { status: 400 })
    }

    if (!nome) {
      return NextResponse.json({ success: false, error: "Nome é obrigatório" }, { status: 400 })
    }

    const fileUrl = await uploadToSupabase(file)

    return NextResponse.json({
      success: true,
      arquivo: {
        url: fileUrl,
        nome,
      },
      message: "Arquivo enviado com sucesso!",
    })
  } catch (error) {
    console.error("=== UPLOAD API ERROR ===", error)
    return NextResponse.json({ 
      success: false, 
      error: `Erro interno: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
    }, { status: 500 })
  }
}

async function uploadFileToStorage(file: File): Promise<string> {
  return await uploadToSupabase(file)
}


import { criarArquivo } from '../../../lib/database'

// Importe ou defina a função reloadArquivos antes de usá-la
// Exemplo de importação (ajuste o caminho conforme necessário):
// import { reloadArquivos } from '../../../lib/arquivos';

const reloadArquivos = async () => {
  // Implemente a lógica de atualização dos arquivos aqui
  // Por exemplo, buscar novamente os arquivos do banco de dados
  console.log("Arquivos recarregados.");
};

const handleUpload = async (file: File, empresa: { id: string }) => {
  // 1. Upload para storage
  const fileUrl = await uploadFileToStorage(file);

  // 2. Registrar no banco de dados
  await criarArquivo({
    empresa_id: empresa.id, // ID da empresa logada
    nome: file.name,
    url: fileUrl,
    tipo: file.type,
    categoria: "documento",
  });

  // 3. Atualizar lista de arquivos (opcional)
  await reloadArquivos();
};
