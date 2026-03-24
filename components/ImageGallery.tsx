'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react"

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
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
        <p className="text-sm font-bold text-muted-foreground whitespace-pre-wrap">
          Nenhuma imagem disponível para exibição no catálogo industrial.
        </p>
      </div>
    )
  }

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + images.length) % images.length)
    }
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % images.length)
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {images.map((arquivo, index) => (
          <div 
            key={arquivo.id || index} 
            onClick={() => setSelectedIndex(index)}
            className="group relative aspect-[4/3] rounded-[2rem] overflow-hidden border border-slate-100 bg-slate-100 transition-all duration-500 hover:shadow-2xl cursor-zoom-in"
          >
            <img
              src={arquivo.url}
              alt={arquivo.nome || 'Imagem da empresa'}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                e.currentTarget.parentElement!.innerHTML = `
                  <div class="h-full w-full flex items-center justify-center bg-gray-200 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                  </div>
                `
              }}
            />
            {/* Overlay com Design Premium */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                <div className="flex items-center justify-between translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <p className="text-white text-[10px] font-black uppercase tracking-[0.15em] truncate max-w-[70%] drop-shadow-lg">{arquivo.nome || 'Industrial'}</p>
                    <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-xl">
                        <Maximize2 className="h-4 w-4" />
                    </div>
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Integrado usando Dialog */}
      <Dialog open={selectedIndex !== null} onOpenChange={() => setSelectedIndex(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-[85vw] lg:max-w-7xl h-[85vh] p-0 border-none bg-black/95 flex items-center justify-center overflow-hidden outline-none">
             <DialogTitle className="sr-only">Visualização de Foto Industrial</DialogTitle>
             
             {selectedIndex !== null && (
                <div className="relative w-full h-full flex items-center justify-center group/lightbox">
                    {/* Botões de Navegação Ultra-Minimalistas */}
                    <button 
                        onClick={handlePrevious}
                        className="absolute left-4 md:left-8 z-50 p-4 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white hover:text-black transition-all opacity-0 group-hover/lightbox:opacity-100"
                    >
                        <ChevronLeft className="h-8 w-8" />
                    </button>

                    <img 
                        src={images[selectedIndex].url} 
                        alt={images[selectedIndex].nome} 
                        className="max-w-full max-h-full object-contain animate-in zoom-in-95 fade-in duration-500"
                    />

                    <button 
                        onClick={handleNext}
                        className="absolute right-4 md:right-8 z-50 p-4 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white hover:text-black transition-all opacity-0 group-hover/lightbox:opacity-100"
                    >
                        <ChevronRight className="h-8 w-8" />
                    </button>

                    {/* Rodapé Informativo */}
                    <div className="absolute bottom-0 inset-x-0 p-10 bg-gradient-to-t from-black/90 to-transparent flex flex-col items-center">
                        <h3 className="text-white font-black uppercase tracking-[0.3em] text-xs md:text-sm mb-3">
                            {images[selectedIndex].nome}
                        </h3>
                        <div className="px-5 py-2 rounded-full bg-white/10 border border-white/20 text-white/50 text-[9px] font-black uppercase tracking-widest">
                            {selectedIndex + 1} • {images.length} Fotos
                        </div>
                    </div>
                </div>
             )}
        </DialogContent>
      </Dialog>
    </>
  )
}
