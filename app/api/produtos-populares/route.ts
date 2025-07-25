import { NextResponse } from "next/server"
import { buscarProdutosMaisVisualizados } from "@/lib/database"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limite = parseInt(searchParams.get('limite') || '6')
    
    const produtos = await buscarProdutosMaisVisualizados(limite)
    
    return NextResponse.json({ 
      success: true, 
      produtos,
      total: produtos.length
    })

  } catch (error) {
    console.error('Erro ao buscar produtos mais visualizados:', error)
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
