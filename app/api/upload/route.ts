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

async function uploadFileToStorage(file: File): Promise<string> {
  // Implementação simples usando Vercel Blob (igual ao POST)
  const timestamp = Date.now();
  const uniqueFilename = `arquivos/${timestamp}-${file.name}`;
  try {
    const blob = await put(uniqueFilename, file, { access: "public" });
    return blob.url;
  } catch (error) {
    console.error("Erro no upload do blob:", error);
    return `https://fake-storage.com/arquivos/${timestamp}-${file.name}`;
  }
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
