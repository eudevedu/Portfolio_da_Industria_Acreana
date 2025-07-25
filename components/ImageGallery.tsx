'use client'

interface ImageGalleryProps {
  images: Array<{
    id: string
    nome: string
    url: string
    tipo: string
    categoria?: string
  }>
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((arquivo, index) => (
        <div key={arquivo.id || index} className="group relative">
          <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100 shadow-sm border">
            <div className="absolute top-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded z-10">
              {arquivo.tipo}
            </div>
            <img
              src={arquivo.url}
              alt={arquivo.nome || 'Imagem da empresa'}
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                console.log('❌ Erro ao carregar imagem:', arquivo.url)
                e.currentTarget.style.display = 'none'
                e.currentTarget.parentElement!.innerHTML = `
                  <div class="h-full w-full flex items-center justify-center bg-gray-200 text-gray-500 text-sm">
                    Erro ao carregar
                  </div>
                `
              }}
              onLoad={() => {
                console.log('✅ Imagem carregada:', arquivo.url)
              }}
            />
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
            <a 
              href={arquivo.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <button className="bg-white text-black px-3 py-1 rounded text-sm hover:bg-gray-100">
                Ver
              </button>
            </a>
          </div>
          <p className="mt-2 text-sm text-gray-600 text-center truncate">{arquivo.nome}</p>
          {arquivo.categoria && (
            <p className="text-xs text-gray-500 text-center">{arquivo.categoria}</p>
          )}
        </div>
      ))}
    </div>
  )
}
