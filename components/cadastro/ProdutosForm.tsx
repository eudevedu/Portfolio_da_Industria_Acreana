"use client"

import { useFieldArray, useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, ImageIcon } from "lucide-react"
import { UploadComponent } from "@/components/upload-component"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CadastroFormData } from "@/lib/schemas/cadastro-schema"

export function ProdutosForm() {
  const { register, control, setValue, formState: { errors } } = useFormContext<CadastroFormData>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: "produtos"
  })

  return (
    <div className="space-y-6 mt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Produtos em Destaque</h3>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={() => append({ nome: "", descricao: "", status: "ativo" })}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Produto
        </Button>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed rounded-xl">
          <p className="text-muted-foreground">Nenhum produto adicionado. Você pode adicionar mais tarde.</p>
        </div>
      )}

      <div className="grid gap-6">
        {fields.map((field, index) => (
          <Card key={field.id} className="relative overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold">Produto #{index + 1}</CardTitle>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="grid md:grid-cols-[180px_1fr] gap-6">
              <div className="space-y-4">
                <Label>Imagem</Label>
                <div className="aspect-square bg-slate-50 rounded-lg border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden">
                  {control._formValues.produtos?.[index]?.imagem_url ? (
                    <img 
                      src={control._formValues.produtos[index].imagem_url} 
                      alt="Preview" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-slate-200" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <UploadComponent
                      onUploadSuccess={(url) => setValue(`produtos.${index}.imagem_url`, url)}
                      acceptedFileTypes="image/*"
                      buttonText="Alterar"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome do Produto *</Label>
                    <Input {...register(`produtos.${index}.nome`)} placeholder="Ex: Mel Orgânico 500g" />
                    {errors.produtos?.[index]?.nome && (
                      <p className="text-red-500 text-xs">{errors.produtos[index].nome?.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Nome Técnico / REF</Label>
                    <Input {...register(`produtos.${index}.nome_tecnico`)} placeholder="Ex: HON-ORG-01" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Descrição curta *</Label>
                  <Textarea 
                    {...register(`produtos.${index}.descricao`)} 
                    placeholder="Principais características e usos do produto..."
                    rows={3}
                  />
                  {errors.produtos?.[index]?.descricao && (
                    <p className="text-red-500 text-xs">{errors.produtos[index].descricao?.message}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <Label>Ficha Técnica (PDF)</Label>
                    <UploadComponent
                      onUploadSuccess={(url) => setValue(`produtos.${index}.ficha_tecnica_url`, url)}
                      acceptedFileTypes="application/pdf"
                      buttonText={control._formValues.produtos?.[index]?.ficha_tecnica_url ? "Alterar PDF" : "Upload PDF"}
                    />
                    {control._formValues.produtos?.[index]?.ficha_tecnica_url && (
                      <p className="text-xs text-green-600 font-bold">PDF Carregado ✓</p>
                    )}
                  </div>
                  <div className="space-y-4">
                    <Label>Folder do Produto (PDF)</Label>
                    <UploadComponent
                      onUploadSuccess={(url) => setValue(`produtos.${index}.folder_produto_url`, url)}
                      acceptedFileTypes="application/pdf"
                      buttonText={control._formValues.produtos?.[index]?.folder_produto_url ? "Alterar PDF" : "Upload PDF"}
                    />
                    {control._formValues.produtos?.[index]?.folder_produto_url && (
                      <p className="text-xs text-green-600 font-bold">PDF Carregado ✓</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Vídeo do Produto (YouTube)</Label>
                  <Input {...register(`produtos.${index}.video_produto`)} placeholder="https://youtube.com/watch?v=..." />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
