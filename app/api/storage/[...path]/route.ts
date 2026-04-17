import { createServerSideClient } from "@/lib/supabase"
import { NextRequest, NextResponse } from "next/server"

/**
 * Proxy de Armazenamento Agnóstico de DNS
 * Recebe: /api/storage/Bucket/Caminho/Para/Arquivo.ext
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const pathSegments = params.path
    if (pathSegments.length < 2) {
      return new NextResponse("Caminho inválido", { status: 400 })
    }

    const bucket = pathSegments[0]
    const filePath = pathSegments.slice(1).join("/")

    const supabase = await createServerSideClient()
    
    // Tentamos baixar o arquivo diretamente
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(filePath)

    if (error || !data) {
      console.error(`[Storage Proxy Erro] ${bucket}/${filePath}:`, error)
      return new NextResponse("Arquivo não encontrado", { status: 404 })
    }

    // Identifica o Content-Type do blob
    const contentType = data.type || "application/octet-stream"

    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        "Access-Control-Allow-Origin": "*", // Permite acesso cross-origin para imagens se necessário
      },
    })
  } catch (error) {
    console.error("[Storage Proxy Exception]:", error)
    return new NextResponse("Erro interno no servidor", { status: 500 })
  }
}
